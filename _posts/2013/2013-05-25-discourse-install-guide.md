---
layout: post
title: Discourse的自动化部署
categories:
- Programming
tags:
- rails
- discourse
---
> 大家可以到这里来讨论 Discourse的安装  [http://www.mydiscourse.org/t/discourse/27](http://www.mydiscourse.org/t/discourse/27)


[Discourse](http://discourse.org/)是一个开源的论坛程序，由Stack Overflow的联合创始人之一Jeff Atwood在离开Stack Overflow后组队创建。他们的目标很宏伟，就是创建一个面向未来十年的论坛程序。具体的一些论坛的特性可以到其官网上查看，这里主要讨论一些其技术相关的东西。
Discourse的源码托管在github上,[https://github.com/discourse/discourse](https://github.com/discourse/discourse)，使用了以下一些相关技术：

- Ruby on Rails ，Discourse的后端是一个rails的app,RESTful的api，返回JSON格式的数据
- Ember.js ，Discourse的前端是一个Ember.js的app，和rails的api进行交互，他们使用这个Ember.js的原因可以参考这篇博文[http://eviltrout.com/2013/02/10/why-discourse-uses-emberjs.html](http://eviltrout.com/2013/02/10/why-discourse-uses-emberjs.html),此博主在Discourse项目中主要担任前端开发工作，他的观点就是如果一个web应用是一个强交互应用的话，那么使用Client MVC的js框架将利大于弊
- PostgreSQL ， 主要的数据都使用PostgreSQL进行存储，这个具有学院派风格的数据库经过多年的发展，稳定性，性能都非常不错，功能全面也是其一大特色。
- Redis ，使用Redis这个kv数据库用于任务队列等功能

如果你想使用Discourse搭建一个论坛，那么一个虚拟主机（VPS）是必不可少的了。本文所使用的主机是在Digital Ocean上申请的，机房选择的是旧金山，国内的访问速度还可以，我是比较熟悉Debian系（比如Debian，Ubuntu...）的Linux发行版本，安装软件直接apt-get解决，非常的方便。所以就选了Debian 7.0 x32 Server，512MB Ram，20GB SSD Disk，不过Discourse官方建议的最低内存是1G。    
<br>
应用的部署使用了一个ruby写的叫做[Capistrano](https://github.com/capistrano/capistrano)的工具，它是一个远程自动部署的工具，支持插件比如这次就使用了一个Capistrano的rbenv插件。    
Capistrano的使用中涉及到两方：一方是客户端，也就是发起运行Capistrano的一方，Capistrano的配置文件都在客户端；另一方是服务器端，也就是最终应用部署的目标容器。我们在客户端中配置好Capistrano以及发布的脚本，然后运行之，Capistrano便会根据脚本通过ssh连接到服务器上进行部署的各项工作，这些步骤无需我们直接操作，我们只需要看着命令行中输出的log便可。   
    
###一.服务器端的各项准备工作

创建好虚拟主机后服务器端的一些工作

####0.准备工作
更新系统：

	apt-get update
	apt-get upgrade
	apt-get install vim #默认的vi不太好用,你也可以选择别的编辑器比如nano

确认下hostname
 	
	vi /etc/hosts #比如 127.0.0.1       localhost mydiscourse.org
   
####1.创建交换区
有些虚拟机提供商可能默认就创建好交换区了，你可以通过free命令来查看，如果free的结果中看到类似如下这一行的时候，说明已经存在swap分区了

		Swap:       524284      23968     500316

swap分区的作用就是当物理内存不够用的时候，系统将物理内存中长时间没有活动的部分转移到swap分区中，以腾出更多的内存供应用使用。当某个程序需要用到swap分区中的内容的时候，在从swap分区中转移出来。
Digital Ocean默认是没有帮你创建好交换分区的，创建的方式如下：

	sudo dd if=/dev/zero of=/swapfile bs=1024 count=512k
	sudo mkswap /swapfile
	sudo swapon /swapfile

然后使用vim编辑/etc/fstab，添加下面这行

	/swapfile       none    swap    sw      0       0

为了安全，得修改swapfile的权限

	sudo chown root:root /swapfile
	sudo chmod 0600 /swapfile

最后再次通过free命令确认下交换分区是否创建成功。

####2.创建发布用户
在Linux中，用户管理是一个和系统安全息息相关的问题，所以控制好用户的权限非常的重要。
首先在服务器上需要创建一个专门用于Capistrano发布的账户，我们叫他deploy user,并且将账户的登录方式限制为公私钥认证的方式，禁掉密码认证的登录方式（甚至可以附带关闭root ssh登录系统的权限），这些设置都是在sshd的配置文件中进行设置。
一开始是root登录，这时你需要增加一个deploy user，我们就假设名字为 `apps`

	adduser apps #增加一个用户 apps
	adduser apps sudo #将apps用户加到sudo组，使其可以使用sudo

这个时候你可以在客户端通过apps用户进行登录了
要设置ssh验证方式，首先得在客户端也就是本机（desktop）上生成密钥对（如果你之前已经有了可以跳过此步）

	ssh-keygen

这个时候会在~/.ssh 目录下生成了两个文件 id_rsa 和 id_rsa.pub，前者为私有，后者为公钥，你需要将公钥内容加到服务器端对应用户的 `~/.ssh/authorized_keys` 文件中，如果authorized_keys不存在则你需要创建一下。
然后为了安全性 设置下相关目录的权限

	chown -R apps:apps .ssh
	chmod 700 .ssh
	chmod 600 .ssh/authorized_keys

这个时候你可以从客户端直接ssh连 过去而不用输入用户密码了，假设这个时候你以apps登录下，我们再把密码验证登录验证的方式关掉。

	#设置成 PasswordAuthentication no	以及 PermitRootLogin no
	sudo vi /etc/ssh/sshd_config
	
	#重启 sshd服务
	sudo service ssh restart 

####3.安装必要的软件


	#编译ruby所需的基础库
	sudo apt-get install build-essential openssl libreadline6 libreadline6-dev \
             curl git-core zlib1g zlib1g-dev libssl-dev libyaml-dev libsqlite3-dev \
             sqlite3 libxml2-dev libxslt-dev autoconf libc6-dev libgdbm-dev \
             ncurses-dev automake libtool bison subversion pkg-config libffi-dev
	#安装nginx
	sudo apt-get install nginx
	#安装PostgreSQL redis
	sudo apt-get install postgresql-9.1 postgresql-contrib-9.1 redis-server \
	                     libxml2-dev libxslt-dev libpq-dev make g++
						 

创建好数据的角色和数据库

	sudo -u postgres createuser apps -s -P
	createdb -U apps discourse_production

由于Discourse有邮件发送的需求，如果你想使用系统本身来发邮件，那么你还得安装sendmail

	apt-get install sendmail    
<br>
###二.客户端的工作
   
####1.客户端安装基础软件
安装git，如果你是使用Linux那么直接使用相关的包管理软件进行安装，如果你使用的是Mac那么可以使用macprot或者brew这些第三方的包管理软件进行安装。当然如果你要使用源码编译的方式安装也是可以的。
安装ruby，你可以直接安装（包管理软件安装或者源码编译），也可以通过ruby版本管理的软件进行间接安装，比如rvm，rbenv。我这里选择了rbenv。
如果你是Linux你得确保编译所需的软件包都安装就绪

	sudo apt-get install build-essential openssl libreadline6 libreadline6-dev \
             curl git-core zlib1g zlib1g-dev libssl-dev libyaml-dev libsqlite3-dev \
             sqlite3 libxml2-dev libxslt-dev autoconf libc6-dev libgdbm-dev \
             ncurses-dev automake libtool bison subversion pkg-config libffi-dev

如果你是Mac，那么XCode以及XCode命令行工具你得安装就位。

安装rbenv以及通过rbenv安装ruby

	#安装rbenv
	git clone git://github.com/sstephenson/rbenv.git ~/.rbenv
	echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile
	echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
	exec $SHELL -l
	
	#安装rbenv的ruby-build插件，方便ruby版本的安装
	git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build
	#安装rbenv的rehash插件，安装了新的gem后再也不用运行rbenv rehash了:)
	git clone https://github.com/sstephenson/rbenv-gem-rehash.git ~/.rbenv/plugins/rbenv-gem-rehash
	
	#安装ruby-2.0.0-p195以及bundler
	rbenv install 2.0.0-p195; 
	rbenv global 2.0.0-p195
	gem install bundler


####2.git库的相关操作
如果你想自己做一些自定义的开发工作或者想为discourse这个开源项目贡献自己的代码，那么你去注册一个github的账号是必不可少的了。
然后从 [https://github.com/discourse/discourse](https://github.com/discourse/discourse) fork一个git库出来，比如我fork出来的地址为 [https://github.com/kejinlu/discourse](https://github.com/kejinlu/discourse)

	#克隆远程库到本地
	git clone git@github.com:kejinlu/discourse.git
	cd discourse
	#增加上游库,以便将上游的更新合并过来
	git remote add upstream git@github.com:discourse/discourse.git 

####3.准备Discourse生产环境所需的配置文件

#####config/database.yml
数据库的配置文件，主要配置数据库的用户名密码，以及相关hostname
 
	cp database.yml.production-sample config/database.yml 
	#然后对用户名密码以及对生产环境对应的host_names进行修改
	vi config/database.yml 

#####config/redis.yml
配置文件可以直接使用样例

	cp redis.yml.sample redis.yml #使用样例的配置即可，无需修改

#####environments/production.rb
次配置文件主要需要修改就是邮件发送的配置，如果你不想使用操作系统中的sendmail进行发送邮件,你可以选择第三方的smtp服务，
比如我就是使用gmail的smtp进行发送的，相关配置如下：     

	config.action_mailer.delivery_method = :smtp
	config.action_mailer.perform_deliveries = true
	config.action_mailer.raise_delivery_errors = true
	config.action_mailer.smtp_settings = {
	 :address              => "smtp.gmail.com",
	 :port                 => 587,
	 :domain               => 'mail.google.com',
	 :user_name            => 'info.mydiscourse@gmail.com',
	 :password             => 'xxxxxxxx',
	 :authentication       => 'plain',
	 :enable_starttls_auto => true  }
	 
	 #config.action_mailer.delivery_method = :sendmail
	 #config.action_mailer.sendmail_settings = {arguments: '-i'}


#####initializers/secret_token.rb
这个文件是rails要用的，默认就存在了，只不过用于开发环境的，你需要生成一个新的secret并对这个文件进行修改

	bundle exec rake secret

将生成的字符串用到`initializers/secret_token.rb`文件中

最后这个文件除了注释掉的只剩下一行

	Discourse::Application.config.secret_token = "你生成的token贴到这里"

#####config/thin.yml
是用于thin的配置文件，

	cp config/thin.yml.sample config/thin.yml

在config/thin.yml最后加上一行

	onebyone: true

当然你也可以自己设置server的数量，一个server在运行的时候对应一个thin的进程，如果你的内存有线可以适当的减少server的数量，比如我设置成了2

	---
	chdir: /home/apps/discourse/current
	environment: production
	address: 0.0.0.0
	port: 3000
	timeout: 30
	log: /home/apps/discourse/shared/log/thin.log
	pid: /home/apps/discourse/shared/pids/thin.pid
	socket: /home/apps/discourse/shared/sockets/thin.sock
	max_conns: 1024
	max_persistent_conns: 100
	require: []
	wait: 30
	servers: 2
	daemonize: true
	onebyone: true

#####config/nginx.conf

	cp config/nginx.conf.sample config/nginx.conf

这是nginx的配置文件，下面是我的配置，upstream里面内容和thin的配置对应,还要记得修改server_name以及location的root的位置

	upstream discourse {
	  server unix:///home/apps/discourse/shared/sockets/thin.0.sock;
	  server unix:///home/apps/discourse/shared/sockets/thin.1.sock;
	}
	
	server {
	
	  listen 80;
	  gzip on;
	  gzip_min_length 1000;
	  gzip_types application/json text/css application/x-javascript;
	
	  server_name mydiscourse.org;
	
	  sendfile on;
	
	  keepalive_timeout 65;
	
	  location / {
	    root /home/apps/discourse/current/public;
	
	    location ~ ^/t\/[0-9]+\/[0-9]+\/avatar {
	      expires 1d;
	      add_header Cache-Control public;
	      add_header ETag "";
	    }
	
	    location ~ ^/assets/ {
	      expires 1y;
	      add_header Cache-Control public;
	      add_header ETag "";
	      break;
	    }
	
	    proxy_set_header  X-Real-IP  $remote_addr;
	    proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
	    proxy_set_header  X-Forwarded-Proto $scheme;
	    proxy_set_header  Host $http_host;
	
	
	    # If the file exists as a static file serve it directly without
	    # running all the other rewite tests on it
	    if (-f $request_filename) {
	      break;
	    }
	
	    if (!-f $request_filename) {
	      proxy_pass http://discourse;
	      break;
	    }
	
	  }
	
	}


由于上面的一些配置中涉及到一些敏感信息，你不不能将其放到public的库中，要不放到私有库中，要么将这些敏感文件加入git的ignore。如果将上述的文件加入ignore的话，那么在下面的deploy脚本中需要将本地的配置在部署的过程中拷贝到目标服务器中，作为生产环境的配置文件，如果你把正式的配置文件都放到了私有的库中，那么这些配置文件其实就没有必要从客户端再拷贝了，下文的deploy.rb脚本中就有从本地拷贝这些配置的过程。

####4.配置Capistrano

往Gemfile中加入两行 

	gem 'capistrano', require: nil
	gem 'capistrano-rbenv', require: nil

增加Capfile

	cp Capfile.sample Capfile

创建config/deploy.rb

	# Require the necessary Capistrano recipes
	require 'capistrano-rbenv'
	require 'bundler/capistrano'
	require 'sidekiq/capistrano'
	
	# Repository settings, forked to an outside copy
	set :repository, 'git://github.com/kejinlu/discourse.git'
	set :deploy_via, :remote_cache
	set :branch, fetch(:branch, 'master')
	set :scm, :git
	
	ssh_options[:keys] = [File.join(ENV["HOME"], ".ssh", "id_rsa")]
	ssh_options[:forward_agent] = true
	
	# General Settings
	set :deploy_type, :deploy
	default_run_options[:pty] = true
	
	
	# Server Settings
	set :user, 'apps'
	set :use_sudo, false
	set :rails_env, :production
	set :rbenv_ruby_version, '2.0.0-p195'
	
	role :app, 'mydiscourse.org', primary: true
	role :db,  'mydiscourse.org', primary: true
	role :web, 'mydiscourse.org', primary: true
	
	# Application Settings
	set :application, 'discourse'
	set :deploy_to, "/home/#{user}/#{application}"
	
	# Keep your bundle up to date!
	#after "deploy:setup" do
	#  run "cd #{current_path} && bundle install"
	#end
	
	namespace :deploy do
	  # Tasks to start, stop and restart thin. This takes Discourse's
	  # recommendation of changing the RUBY_GC_MALLOC_LIMIT.
	  desc 'Start thin servers'
	  task :start, :roles => :app, :except => { :no_release => true } do
	    run "cd #{current_path} && RUBY_GC_MALLOC_LIMIT=90000000 bundle exec thin -C config/thin.yml start", :pty => false
	  end
	
	  desc 'Stop thin servers'
	  task :stop, :roles => :app, :except => { :no_release => true } do
	    run "cd #{current_path} && bundle exec thin -C config/thin.yml stop"
	  end
	
	  desc 'Restart thin servers'
	  task :restart, :roles => :app, :except => { :no_release => true } do
	    run "cd #{current_path} && RUBY_GC_MALLOC_LIMIT=90000000 bundle exec thin -C config/thin.yml restart"
	  end
	
	  # Sets up several shared directories for configuration and thin's sockets,
	  # as well as uploading your sensitive configuration files to the serer.
	  # The uploaded files are ones I've removed from version control since my
	  # project is public. This task also symlinks the nginx configuration so, if
	  # you change that, re-run this task.
	  task :setup_config, roles: :app do
	    run  "mkdir -p #{shared_path}/config/initializers"
	    run  "mkdir -p #{shared_path}/config/environments"
	    run  "mkdir -p #{shared_path}/sockets"
	    put  File.read("config/database.yml"), "#{shared_path}/config/database.yml"
	    put  File.read("config/redis.yml"), "#{shared_path}/config/redis.yml"
	    put  File.read("config/environments/production.rb"), "#{shared_path}/config/environments/production.rb"
	    put  File.read("config/initializers/secret_token.rb"), "#{shared_path}/config/initializers/secret_token.rb"
	    put  File.read("config/thin.yml"), "#{shared_path}/config/thin.yml"
	    put  File.read("config/nginx.conf"), "#{shared_path}/config/nginx.conf"
	    sudo "ln -nfs #{shared_path}/config/nginx.conf /etc/nginx/sites-enabled/#{application}"
	    puts "Now edit the config files in #{shared_path}."
	  end
	
	  # Symlinks all of your uploaded configuration files to where they should be.
	  task :symlink_config, roles: :app do
	    run  "ln -nfs #{shared_path}/config/database.yml #{release_path}/config/database.yml"
	    run  "ln -nfs #{shared_path}/config/newrelic.yml #{release_path}/config/newrelic.yml"
	    run  "ln -nfs #{shared_path}/config/redis.yml #{release_path}/config/redis.yml"
	    run  "ln -nfs #{shared_path}/config/environments/production.rb #{release_path}/config/environments/production.rb"
	    run  "ln -nfs #{shared_path}/config/initializers/secret_token.rb #{release_path}/config/initializers/secret_token.rb"
	    run  "ln -nfs #{shared_path}/config/thin.yml #{release_path}/config/thin.yml"
	  end
	end
	
	after "deploy:setup", "deploy:setup_config"
	after "deploy:finalize_update", "deploy:symlink_config"
	
	# Tasks to start/stop/restart the clockwork process.
	namespace :clockwork do
	  desc "Start clockwork"
	  task :start, :roles => [:app] do
	    run "cd #{current_path} && RAILS_ENV=#{rails_env} bundle exec clockworkd -c #{current_path}/config/clock.rb --pid-dir #{shared_path}/pids --log --log-dir #{shared_path}/log start"
	  end
	
	  task :stop, :roles => [:app] do
	    run "cd #{current_path} && RAILS_ENV=#{rails_env} bundle exec clockworkd -c #{current_path}/config/clock.rb --pid-dir #{shared_path}/pids --log --log-dir #{shared_path}/log stop"
	  end
	
	  task :restart, :roles => [:app] do
	    run "cd #{current_path} && RAILS_ENV=#{rails_env} bundle exec clockworkd -c #{current_path}/config/clock.rb --pid-dir #{shared_path}/pids --log --log-dir #{shared_path}/log restart"
	  end
	end
	
	after  "deploy:stop",    "clockwork:stop"
	after  "deploy:start",   "clockwork:start"
	before "deploy:restart", "clockwork:restart"
	
	namespace :db do
	  desc 'Seed your database for the first time'
	  task :seed do
	    run "cd #{current_path} && psql -d discourse_production < pg_dumps/production-image.sql"
	  end
	end
	
	after  'deploy:update_code', 'deploy:migrate'


####5.运行Capistrano
初次安装部署

	bundle install
	cap deploy:setup
	cap deploy:cold #第一次运行之后更新重启的时候只需要 cap deploy 便可
	

升级部署


	git fetch upstream
	git merge upstream/master
	git push origin master
	cap deploy