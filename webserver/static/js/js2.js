function plot_data(data){
    var tooltip = d3.select('.result')
        .append("div")
        .classed('tooltip', true)		
        .style("opacity", 0);
    var svg = d3.select(".result")
        .append("svg")
        .attr("height", 1200)
        .attr("width", 2000)
        .append('g')
            .classed("svg", true)
            .classed("data_field", true)


    var x = d3.scaleLinear()
        .domain([0, 300])
        .range([10, 1400])

    var sliderSimple = d3
        .sliderBottom()
        .min(0)
        .max(15)
        .width(x(200))
        .ticks(5)
        .step(1)
        .default(0)
        .on('onchange', val => {
            // update(data, val)
        });
    
        var gSimple = svg
        .append('g')
        .attr('transform', function(d) { 
            return 'translate(' + (x(200) - x(300) / 2) + 
            ',' + x(0) + ')'; })
    
        gSimple.call(sliderSimple);


    var vertical_margin = 90
    var horisontal_margin = 50
    var stroke_block_width = 50
    var stroke_block_height = 10
    var stroke_block_height_margin = 20

    var nn_block_width = 50
    var nn_block_height = stroke_block_height * 3 + stroke_block_height_margin * 3
    var nn_sub_block_width = nn_block_width * 0.8
    var nn_sub_block_height = nn_block_height * 0.8
    var nn_sub_block_height_margin = (nn_block_height - nn_sub_block_height * 2) / 3

    var canvas_width = x(nn_block_height) / 2.6

    var stroke_rendered_width = (canvas_width) / 2.5
    var stroke_rendered_margin = ((canvas_width) - (2 * stroke_rendered_width))

    index = -1
    var stroke = svg
        .selectAll('.stroke')
        .data([{'text': 'Parameters of stroke shape, number of them depends on stroke type'}, 
               {'text': 'Parameters of stroke color: RGB'}, 
               {'text': 'Parameters of stroke alpha channel (transparency)'}])
        .enter()
        .append('g')
        .attr('transform', function(d) {
            index += 1
            edge_height = x(stroke_block_height) + index * x((stroke_block_height + stroke_block_height_margin))
            return 'translate(' + x(horisontal_margin) + 
                ',' + (x(vertical_margin) + index * x((stroke_block_height + stroke_block_height_margin))) + ')'; })
        .classed("stroke", true)
        .on("mousemove", function(event, d){
            // console.log(event)
            tooltip
                .style('opacity', 1.0);
            tooltip
                .html(d['text'])
                .style("rigth", event.layerX + "px")		
                .style("top", event.layerY - 28 + "px");
        })
        .on("mouseout", function(d) {		
            tooltip
                // .transition()		
                // .duration(500)		
                .style("opacity", 0);	
        })
            // .data(function(d){ return d})
            // .enter()
            .append('rect')
            .attr("height", x(stroke_block_height))
            .attr("width", x(stroke_block_width))
                    .attr("rx", 6)
                    .attr("ry", 6)
            .classed("custom-header", true)
            .classed("stroke_rect", true)

    index = -1
    d3.selectAll('.stroke')
        .append('text')
        .text(function(d){
            index += 1
            if (index == 0){
                return 'SHAPE'
            }
            if (index == 1){
                return 'COLOR'
            }
            if (index == 2){
                return 'ALPHA'
            }
        })
        .attr('y', x(stroke_block_height)/1.25)
        .attr('x', x(stroke_block_width)/2)
        .style("text-anchor", "middle")
        .classed('stroke_text', true)
        // .attr('transform', function(d) {
        //     index += 1
        //     // edge_height = x(stroke_block_height) + index * x((stroke_block_height + stroke_block_height_margin))
        //     return 'translate(' + x(0.0) + 
        //         ',' + (x(vertical_margin) + x(stroke_block_height)/2 + index * x((stroke_block_height + stroke_block_height_margin))) + ')'; })

    var nn = svg
        .append('g')
        .selectAll('.nn')
        .data([{}])
        .enter()
            .append('rect')
            .attr("height", edge_height)
            .attr("width", x(nn_block_width))
            .attr('transform', function(d) {
                edge_width = x(nn_block_width) + 50.0 + x(stroke_block_width)
                return 'translate(' + (50.0 + x(stroke_block_width) + x(horisontal_margin)) +  
                ',' + (x(vertical_margin)) + ')'; })
                .attr("rx", 6)
                .attr("ry", 6)
            .classed("nn", true)
            .classed("custom-header", true)


    var image = svg
        .append('g')
        .selectAll('#image_canvas')
        .data([{}])
        .enter()
            .append('rect')
            .attr("height", (canvas_width))
            .attr("width", (canvas_width))
            .attr('transform', function(d) { 
                return 'translate(' + (50.0 + edge_width + x(horisontal_margin)) + 
                ',' + (x(vertical_margin) - (canvas_width) - (canvas_width / 1)) + ')'; })
            .attr("id", 'image_canvas')
            .classed("custom-header", true)
    d3.select('.data_field')
        .append("defs")
        .append("pattern")
        .attr("height", d3.select('#image_canvas').attr('height'))
        .attr("width", d3.select('#image_canvas').attr('width'))
        .attr('patternUnits', "userSpaceOnUse")
        .attr("id", "bg")
            .append("image")
            .attr("height", d3.select('#image_canvas').attr('height'))
            .attr("width", d3.select('#image_canvas').attr('width'))
            // .attr("xlink:href", "none")
            .attr('id', 'bg_image_canvas')
    
    var predict = svg
        .append('g')
        .selectAll('#predict')
        .data([{}])
        .enter()
            .append('rect')
            .attr("height", (canvas_width))
            .attr("width", (canvas_width))
            .attr('transform', function(d) { 
                return 'translate(' + (50.0 + edge_width + x(horisontal_margin)) + 
                ',' + (x(vertical_margin)) + ')'; })
            .attr('id', "predict")
            .classed("custom-header", true)

    index = -1
    var stroke_rendered = svg
        .append('g')
        .selectAll('.stroke_rendered')
        .data([{}, {}, {}, {}])
        .enter()
            .append('rect')
            .attr("height", (stroke_rendered_width))
            .attr("width", (stroke_rendered_width))
            .attr('transform', function(d) {
                index += 1
                let w = (50.0 + edge_width + x(horisontal_margin))
                let h = x(vertical_margin) + edge_height - (stroke_rendered_width + (stroke_rendered_margin)) - (stroke_rendered_width)
                // let h = x(vertical_margin + nn_block_height / 2 + 10)
                if (index == 1){
                    w = w + (stroke_rendered_width + stroke_rendered_margin)
                }
                if (index == 2){
                    h  = h + (stroke_rendered_width + stroke_rendered_margin)
                }
                if (index == 3){
                    w = w + (stroke_rendered_width + stroke_rendered_margin)
                    h  = h + (stroke_rendered_width + stroke_rendered_margin)
                }

                return 'translate(' + 
                w + 
                ',' + 
                h + 
                ')'
            })
            .attr("rx", 6)
            .attr("ry", 6)
            .classed("stroke_rendered", true)
            .classed("custom-header", true)


    let pattern = /(\d+\.?\d+)/g
    // svg.append("path")
    //     .datum([{
    //         'x': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + x(canvas_width) / 2,
    //         'y': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]), 
    //     }, {
    //         'x': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]),
    //         'y': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]), 
    //     }])
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     // .attr("stroke-width", 1.5)
    //     // .attr("markerWidth", 6)
    //     // .attr("markerHeight", 6)
    //     // .attr("orient", "auto")
    //     // .attr("refX", 15)
    //     // .attr("refY", -1.5)
    //     .attr("d", d3.line()
    //         .x(function(d) { return d['x'] })
    //         .y(function(d) { return d['y'] })
    //     )
    var arrows = svg
        // .append('g')

    draw_arrow(arrows, 
        [{
            'x': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + (canvas_width) / 2,
            'y': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (canvas_width), 
        }, 
        {
            'x': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + (canvas_width) / 2,
            'y': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]), 
        }, ]  , 0
    )

    console.log(stroke._groups)
    for (var i=0; i<stroke._groups[0].length; i++){
        draw_arrow(arrows, 
            [
            {
                'x': Number(Array.from(nn._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]),
                'y': Number(Array.from(stroke._groups[0][i].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2, 
            }, {
                'x': Number(Array.from(stroke._groups[0][i].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]) + x(stroke_block_width),
                'y': Number(Array.from(stroke._groups[0][i].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2, 
            }] ,
            0,)
        }

    draw_arrow(arrows, 
        [{
            'x': Number(Array.from(stroke_rendered._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]),
            'y': Number(Array.from(stroke_rendered._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (stroke_rendered_width + stroke_rendered_margin / 2), 
        },{
            'x': Number(Array.from(nn._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + x(nn_block_width),
            'y': Number(Array.from(stroke_rendered._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (stroke_rendered_width + stroke_rendered_margin / 2), 
        },], 0
        )

    draw_arrow(arrows, 
        [{
            'x': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + (stroke_rendered_width + stroke_rendered_margin / 2),
            'y': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (canvas_width), 
        },
        {
            'x': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + (stroke_rendered_width + stroke_rendered_margin / 2),
            'y': Number(Array.from(stroke_rendered._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]), 
        },] , 0
        )

    draw_arrow(arrows, 
        [{
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]),
            'y': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2 + 2 * x(stroke_block_height + stroke_block_height_margin), 
        },
        {
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]) - 19,
            'y': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2 + 2 * x(stroke_block_height + stroke_block_height_margin), 
        },
        {
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]) - 19,
            'y': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2 + 1 * x(stroke_block_height + stroke_block_height_margin), 
        },
        {
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]),
            'y': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2 + 1 * x(stroke_block_height + stroke_block_height_margin), 
        },
        {
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]) - 19,
            'y': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2 + 1 * x(stroke_block_height + stroke_block_height_margin), 
        },
        {
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]) - 19,
            'y': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2, 
        },
        {
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]),
            'y': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2, 
        },
        {
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]) - 19,
            'y': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2, 
        },
        {
            'x': Number(Array.from(stroke._groups[0][0].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]) - 19,
            'y': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (canvas_width)/ 2, 
        },
        {
            'x': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]),
            'y': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (canvas_width)/ 2, 
        }] , 0
    )
}

function draw_arrow(svg, data, delay){
    // pp = svg.append('g')
    var line = d3.line()
        .curve(d3.curveLinear)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

    var path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("d", line)
        .classed('arrow_line', true)
        .classed('glowing_line_main', true)
    
    function repeat_arrow(){
        var totalLength = path.node().getTotalLength();
        path
            .attr("stroke-dashoffset", 0)
            .transition(d3.easeLinear)
            .delay(1000)
            .duration(1000)
            .attr("stroke-dasharray", totalLength+","+totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition(d3.easeLinear)
            .duration(1000)
            .attr("stroke-dasharray", totalLength+","+0)
            // .attr("stroke-dashoffset", 0)
            // .transition(d3.easeLinear)
            // // .duration(2000)
            // .transition(d3.easeLinear)
            // .duration(2000)
            // .attr("stroke-dasharray", totalLength+","+0)
            // .attr("stroke-dashoffset", 0)
            .on('end', repeat_arrow)
    }
    repeat_arrow()

    // svg
    //     .append('circle')
    //     .data(data.slice(0))
    //     .attr('cx', function(d) { return d.x})
    //     .attr('cy', function(d) { return d.y})
    //     .attr('r', 5)
    //     .attr('fill', 'none')
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 2.5)
    //     .classed('arrow_end', true)
}