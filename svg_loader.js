
function svgLoader() {
    let svgLoader = this;
    
    // TODO: remove the load_all to documentation for reference
    svgLoader.svg_elements = {};
     
    svgLoader.load_all = function (svgs) {
        svgs.forEach((svg)=> {
            svgLoader.load_svg(svg.uri, svg.name,
            (name, svg) => {
                svgLoader.svg_elements[name] = svg;
            },
            (name, xhr) => {
                console.log('xhr load failed for ' + name);
                console.log(xhr);
                }
            )
        });
    }
 
    svgLoader.load_svg = function (uri, name, callback, error_callback) {
        xhr = new XMLHttpRequest();
        xhr.open("GET", uri, false);
        xhr.overrideMimeType("image/svg+xml");
        xhr.onload = function(e) {
          if (xhr.readyState == 4) {
            if (xhr.status == 200 ) {
                callback(name, xhr.responseXML.documentElement); 
            } else {
                error_callback(name, xhr);
            }
          }
        };
        xhr.send();
    }
}
