var Project = Backbone.Model.extend({
	idAttribute:"url",
	defaults:function(){

		return{
			//idAttribute:"title",
			// folder:"",
			// thumbnail:"",
			// title:"",
			// task:"",
			// description:"",
			// images:""
		};
	},//default
});



var Projects = Backbone.Collection.extend({
	model:Project,
	url:"json/projects.json",
});



var ProjectView = Backbone.View.extend({

	tagName:"div",
	className:"project clickable",
	attributes:{
	},

	initialize:function(options){
		var self = this;
		this.bus = options.bus;
	},

	events:{
		"click img": "project_clicked"
	},

	project_clicked: function(e){
		console.log("clicked project",this);
		console.log(this.model.get("url"));
		router.navigate("projects/"+this.model.get("url"),{trigger: true});
	},

	render: function(){
		console.log("render project model");
		var template = _.template($("#projectTemplate").html());
		var html = template(this.model.toJSON());
		this.$el.html(html);
		return this;
	},//render
});



var ProjectsView= Backbone.View.extend({
	initialize:function(options){
		var self = this;
		this.bus = options.bus;
	},

	render:function(){
		console.log("collections render");
		var self = this;
		this.collection.each(function(obj){
			var projectView = new ProjectView({model:obj, bus:self.bus});
			self.$el.append(projectView.render().$el);
		});
	}
});



var ShowProjectView= Backbone.View.extend({
	initialize:function(options){
		var self = this;
		this.bus = options.bus;
		this.bus.on("showProject", this.onShowProject, this);
		this.bus.on("showPrevProject", this.onShowPrevProject, this);
		this.bus.on("showNextProject", this.onShowNextProject, this);
		this.prevNextView = new PrevNextView({el:(this.$el).find(".title-nav"), bus:this.bus});
		this.footerPrevNext = new PrevNextView({el:(this.$el).find(".footer"), bus:this.bus, prepend:1});
	},

	onShowProject: function(project){
		this.currProject= project;
		console.log(project);
		this.render(project);
		$(document).scrollTop(0);
	},

	navigate:function(num){
		var index =projects.indexOf(this.currProject)+num;

		if (index==projects.length){
			index=0;
		}
		else if(index <0){
			index=projects.length-1;
		}
		console.log(index);
		var project=projects.at(index);
		router.navigate("projects/"+project.get("url"));
		this.onShowProject(project);
	},

	onShowNextProject:function(){
		this.navigate(1);
	},

	onShowPrevProject:function(){
		console.log(projects.indexOf(this.currProject));
		this.navigate(-1);
	},

	render:function(project){
		var template =_.template($("#showProjectTemplate").html());
		var html = $(template(project.toJSON()));
		var title = html.find(".title");
		var images = html.find(".image");
		var task = html.find(".task");
		var description =html.find(".description");

		this.$el.find(".title-nav").html(title);
		this.$el.find(".body").html(images);
		this.$el.find(".footer").html("");

		this.$el.find(".footer").append(description);
		this.$el.find(".footer").append(task);
		this.prevNextView.render();
		this.footerPrevNext.render();
		return this;
	}

});



var PrevNextView= Backbone.View.extend({
	initialize:function(options){
		console.log("initprevnext");
		var self = this;
		this.bus = options.bus;
		this.prepend = options.prepend;
		//this.render();
	},
	events:{
		"click .prev":"onPrevClick",
		"click .next":"onNextClick",
	},

	onPrevClick: function(){
		console.log("prevCliked");
		this.bus.trigger("showPrevProject",this);
	},

	onNextClick:function(){
		console.log("mextclicker");
		this.bus.trigger("showNextProject",this);
	},

	render:function(){
		console.log("prevnext render");
		var template = _.template($("#prevNextTemplate").html());
		console.log("prepend", this.prepend);
		if (this.prepend){
			this.$el.prepend(template);
		}
		else{
			this.$el.append(template);
		}
		return this;
	}
});



var HeaderNavView= Backbone.View.extend({
	initialize:function(options){
		console.log("headerNavView");
		var self = this;
		this.bus = options.bus;
		console.log($(".header-container"));
	},

	events:{
		"click .nav-logo":"onProjectsClick",
		"click .nav-project": "onProjectsClick",
		"click .nav-about": "onAboutClick",
		"click .menu-icon":"showDropMenu"
	},

	showDropMenu: function(){
		console.log("menuiconclicked");
		$(".menu-dropdown").toggleClass("showMenu");
	},

	onProjectsClick:function(e){
		e.preventDefault();
		console.log("headerNavProjectsClicked");
		router.navigate("projects",{trigger:true});
		$(".menu-dropdown").toggleClass("showMenu");
	},

	onAboutClick:function(e){
		e.preventDefault();
		console.log("headerNavAboutClicked");
		router.navigate("about",{trigger:true});
		$(".menu-dropdown").toggleClass("showMenu");
	}

});



var projects = new Projects();
var eventBus = _.extend({},Backbone.Events);
var headerNavView = new HeaderNavView({el:".header-container",bus:eventBus});
var dropMenuNavView = new HeaderNavView({el:".menu-dropdown",bus:eventBus});



var AppRouter = Backbone.Router.extend({
	initialize:function(options){
		var self = this;
		this.bus = options.bus;
	},

	routes:{
		"": "viewHome",
		"projects":"viewHome",
		"projects/:projectId":"viewProjectById",
		"about":"about",
		"*other":"defaultRoute"
	},

	viewHome:function(){
		console.log("home");
		$("#projects").hide();
		$("#thumbnails").show();
		$("#about").hide();
	},

	viewProjectById:function(projectId){
		$("#projects").show();
		$("#thumbnails").show();
		$("#about").hide();

		console.log("project url",projectId,projects);

		if(projects.get(projectId)){
			var currProject =projects.get(projectId);
			console.log(currProject);
			this.bus.trigger("showProject",currProject);
		}
		else{
			this.defaultRoute();
		}
	},

	about:function(){
		console.log("about");
		$("#projects").hide();
		$("#thumbnails").hide();
		$("#about").show();
	},

	defaultRoute:function(){
		console.log("page not found");
	}
});



var router;


projects.fetch({
	success:function(){
		console.log("test");
		console.log(projects);
		var showProjectView = new ShowProjectView({el:"#projects", bus:eventBus});

		var projectsView = new ProjectsView({ el:"#thumbnails", collection:projects, bus:eventBus});
		projectsView.render();

		router = new AppRouter({bus:eventBus});
		Backbone.history.start();
	}
});
