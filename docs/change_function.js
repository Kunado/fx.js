let def = document.querySelector(".function_def");
let changeFunction = function(event) {
	let demo_fx = document.querySelector(".demo_fx");
	demo_fx.setAttribute("function", def.value);
}
def.addEventListener("change", changeFunction);