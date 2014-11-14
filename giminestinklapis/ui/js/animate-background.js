$.fn.preload = function() {
    this.each(function(){
        $('<img/>')[0].src = this;
    });
}
var images = Array("ui/css/images/door-closed.png",
					"ui/css/images/door-closed.png",
					"ui/css/images/door-opened.png",
					"ui/css/images/door-light.png",
					"ui/css/images/tree.png",
					"ui/css/images/tree-branch-1.png",
					"ui/css/images/tree-branch-2.png",
					"ui/css/images/tree-light.png",
					"ui/css/images/tree-leaves.png",
					"ui/css/images/tree-apples.png",
					"ui/css/images/fall-apples.png"
					);

$([images[0],images[1],images[2],images[3],
	images[4],images[5],images[6],images[7],
	images[8], images[9], images[10]]).preload();

// Usage:

var currimg = 0;

$(window).load(function() {
    
	$("#loading").fadeOut(2000);

	setTimeout(loadimg(), 2000); 
	
	function loadimg(){
		
		var visited = $.cookie("visited");
		
		if (visited == null) {
			
			//finished animating, minifade out and fade new back in           
			$('#bg-next').animate({ opacity: 0.1 }, 1000, function(){
				
				currimg++;
				
				//set timer for next
				if (currimg < images.length-1) {
					
					setTimeout(loadimg,20);
				}
				else {
					//animate form opacity
					setTimeout(function() {
						$('.access_container').animate({ opacity: 0.9 }, 400, function(){});
					}, 1000); 
					// set cookie
					$.cookie('visited', 'yes', { expires: 1, path: '/' });
				}
				
				var newimage = images[currimg];
			
				//swap out bg src                
				$('#bg-next').css("background-image", "url("+newimage+")"); 
				
				//animate fully back in
				$('#bg-next').animate({ opacity: 1 }, 600, function(){
				
					//swap out bg src                
					$('#bg').css("background-image", "url("+newimage+")"); 
				
				});

			});	
		}
		else {
			$('#bg').css("background-image", "url("+images[9]+")"); 
			//animate form opacity
			setTimeout(function() {
				$('.access_container').animate({ opacity: 0.9 }, 400, function(){});
			}, 1000); 
		}
     }
});