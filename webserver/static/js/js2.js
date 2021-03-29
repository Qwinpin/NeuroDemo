function plot_data(data){
    window.current_step = 0
    window.svg = d3.select(".result")
        .append("svg")
        .attr("height", 2400)
        .attr("width", 2000)
        .append('g')
            .classed("svg", true)
            .classed("data_field", true)
    window.x = d3.scaleLinear()
        .domain([0, 300])
        .range([10, 1400])
    
    
    window.vertical_margin = 55
    window.horisontal_margin = 50
    window.stroke_block_width = 50
    window.stroke_block_height = 5
    window.stroke_block_height_margin = 15
    
    window.nn_block_width = 70
    window.nn_block_height = stroke_block_height * 3 + stroke_block_height_margin * 3
    window.nn_sub_block_width = nn_block_width * 0.8
    window.nn_sub_block_height = nn_block_height * 0.2
    window.nn_sub_block_height_margin = (nn_block_height - nn_sub_block_height * 2) / 5
    
    window.canvas_width = x(nn_block_height) / 2.6
    
    window.stroke_rendered_width = (canvas_width) / 2.5
    window.stroke_rendered_margin = ((canvas_width) - (2 * stroke_rendered_width))
    var tooltip = d3.select('.result')
        .append("div")
        .classed('tooltip', true)		
        .style("opacity", 0);



    var sliderSimple = d3
        .sliderBottom()
        .min(0)
        .max(15)
        .width(x(200))
        .ticks(5)
        .step(1)
        .default(0)
        .on('onchange', val => {
            if (typeof data_processed != "undefined") {
                current_step = val
                update_stroke(data_processed)
                update_predict(data_processed)
            }
            
        });
    
        var gSimple = svg
        .append('g')
        .attr('transform', function(d) { 
            return 'translate(' + (x(200) - x(300) / 2) + 
            ',' + x(0) + ')'; })
    
        gSimple.call(sliderSimple);

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
                .style("rigth", event.pageX + "")		
                .style("top", event.pageY - 28 + "");
        })
        .on("mouseout", function(d) {		
            tooltip
                // .transition()		
                // .duration(500)		
                .style("opacity", 0);	
        })
        .on("click", function(event, d){
            console.log(d)
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

    shift = x(vertical_margin) + x(nn_sub_block_height_margin)
    var nn = svg
        .append('g')
        // .attr("height", edge_height)
        // .attr("width", x(nn_block_width))
        // .classed("nn", true)
        // .classed("custom-header", true)

    nn
        .append('g')
        .selectAll('.nn')
        .data([{'text': 'Neural network architecture (high level abstraction) used for stroke parameters searching'}])
        .enter()
            .append('rect')
            .attr("height", edge_height)
            .attr("width", x(nn_block_width))
            .attr('transform', function(d) {
                edge_width = x(nn_block_width) + 50.0 + x(stroke_block_width)
                return 'translate(' + (50.0 + x(stroke_block_width) + x(horisontal_margin)) +  
                ',' + (x(vertical_margin)) + ')'; })
            .classed("nn", true)
            .classed("custom-header", true)
            .on("click", function(event, d){
                console.log(d)
            })
            .on("mousemove", function(event, d){
                console.log(event)
                tooltip
                    .style('opacity', 1.0);
                tooltip
                    .html(d['text'])
                    .style("left", (event.pageX) + "px")		
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", function(d) {		
                tooltip
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);	
            })

    var data = {
        'dcgan_plot': [{'text': 'Generate color of each pixel of new image according to input strokes parameters'}],
        'dcgan_sub_layer': [{'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}], 'state': [[[0,1,2]]]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}], 'state': [[[0,1,2]]]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}], 'state': [[[0,1,2]]]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input', 'layers': [{'name': 'ConvTranspose2d'}]}]
    }
    var nn_sub = nn
        .selectAll('.nn_sub')
        .data([{'text': 'DCGAN'}, {'text': 'PixelShuffle'}])
        .enter()
            .append('g')
            .classed("nn_sub", true)
            .attr('transform', function(d){
                res = 'translate(' + (50 + x(stroke_block_width) + x(horisontal_margin) + (x(nn_block_width) - x(nn_sub_block_width)) / 2) + 
                ',' + 
                shift + 
                ')'
    
                shift += x(nn_sub_block_height_margin) + x(nn_sub_block_height)
                return res
            })
            .on("click", function(event, d){
                console.log(d)
                if (d.text == 'DCGAN'){
                    draw_dcgan(data)
                }
            })
        
    nn_sub
        .append('rect')
        .attr("rx", 6)
        .attr("ry", 6)
        .attr('height', x(nn_sub_block_height))
        .attr('width', x(nn_sub_block_width))
        .classed("custom-header", true)

    nn_sub
        .append('text')
        .text(function(d){
            return d.text
        })
        .classed('stroke_text', true)
        .style("text-anchor", "middle")
        .attr('transform', function(d){
            res = 'translate(' + 
            x(nn_sub_block_width) / 2 + 
            ',' + 
            x(nn_sub_block_height) / 1.25 + 
            ')'

            return res
        })


    var image = svg
        .append('g')
        .selectAll('#image_canvas')
        .data([{'text': 'Origin image'}])
        .enter()
            .append('rect')
            .attr("height", (canvas_width))
            .attr("width", (canvas_width))
            .attr('transform', function(d) { 
                return 'translate(' + (50.0 + edge_width + x(horisontal_margin)) + 
                ',' + (x(vertical_margin) - (canvas_width) - (canvas_width / 1)) + ')'; })
            .attr("id", 'image_canvas')
            .classed("custom-header", true)
            .on("click", function(event, d){
                console.log(d)
            })

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
        .data([{'text': 'Painted image'}])
        .enter()
            .append('rect')
            .attr("height", (canvas_width))
            .attr("width", (canvas_width))
            .attr('transform', function(d) { 
                return 'translate(' + (50.0 + edge_width + x(horisontal_margin)) + 
                ',' + (x(vertical_margin)) + ')'; })
            .attr('id', "predict")
            .classed("custom-header", true)
            .on("click", function(event, d){
                console.log(d)
            })

    d3.select('.data_field')
        .append("defs")
        .append("pattern")
        .attr("height", d3.select('#image_canvas').attr('height'))
        .attr("width", d3.select('#image_canvas').attr('width'))
        .attr('patternUnits', "userSpaceOnUse")
        .attr("id", "predicted_image")
            .append("image")
            .attr("height", d3.select('#image_canvas').attr('height'))
            .attr("width", d3.select('#image_canvas').attr('width'))
            // .attr("xlink:href", "none")
            .attr('id', 'predict_canvas')

    index = -1
    var stroke_rendered = svg
        .append('g')
        .selectAll('.stroke_rendered')
        .data([{'text': 'Stroke visualization'}, {'text': 'Stroke visualization'}, {'text': 'Stroke visualization'}, {'text': 'Stroke visualization'}])
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
            .classed("stroke_rendered", true)
            .classed("custom-header", true)
            .on("click", function(event, d){
                console.log(d)
            })

    var layers_description = svg
        .append('g')
        .datum([{'test': 'test'}])


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
    // for (var i=0; i<stroke._groups[0].length; i++){
    //     draw_arrow(arrows, 
    //         [
    //         {
    //             'x': Number(Array.from(nn._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]),
    //             'y': Number(Array.from(stroke._groups[0][i].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2, 
    //         }, {
    //             'x': Number(Array.from(stroke._groups[0][i].parentElement.attributes[0].nodeValue.matchAll(pattern))[0][0]) + x(stroke_block_width),
    //             'y': Number(Array.from(stroke._groups[0][i].parentElement.attributes[0].nodeValue.matchAll(pattern))[1][0]) + x(stroke_block_height) / 2, 
    //         }] ,
    //         0,)
    //     }

    // draw_arrow(arrows, 
    //     [{
    //         'x': Number(Array.from(stroke_rendered._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]),
    //         'y': Number(Array.from(stroke_rendered._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (stroke_rendered_width + stroke_rendered_margin / 2), 
    //     },{
    //         'x': Number(Array.from(nn._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + x(nn_block_width),
    //         'y': Number(Array.from(stroke_rendered._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (stroke_rendered_width + stroke_rendered_margin / 2), 
    //     },], 0
    //     )

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


function draw_dcgan(data){

    plot_states([[[0, 1, 2]]])
    // console.log('WW')
    var dcgan_width = x(stroke_block_width)// + x(stroke_block_width) + 50
    var dcgan_height = x(nn_block_height * 2)

    var sub_layer_width = 90
    var sub_layer_height = 100 / 4 - 3

    var layer_height = sub_layer_height / 4

    dcgan_x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, (dcgan_width)])
    dcgan_y = d3.scaleLinear()
        .domain([0, 100])
        .range([0, (dcgan_height)])

    var plot = svg
        .selectAll('.dcgan_plot')
        .data(data['dcgan_plot'])
        .enter()
        .append('g')
        .attr('transform', function(d) { 
            return 'translate(' + x(horisontal_margin) + 
            ',' + (x(vertical_margin) + x(nn_block_height)) + ')'; })
        .classed('dcgan_plot', true)

    plot
        .append('rect')
        .attr("width", dcgan_x(100))
        .attr("height", dcgan_y(100))
        .attr("rx", 6)
        .attr("ry", 6)
        .classed("custom-header", true)

    shift_v = dcgan_y(5)
    var dcgan_sub_layer = plot
        .selectAll('.dcgan_sub_layer')
        .data(data['dcgan_sub_layer'])
        .enter()
        .append('g')
        .attr('transform', function(d, index) { 
            // console.log(d, index)
            res = 'translate(' + dcgan_x(5) + 
            ',' + shift_v + ')'; 
            shift_v += dcgan_y(5) + (dcgan_y(sub_layer_height))
            return res})
        .datum(function(d){
            // console.log(d)
            return d
        })
        .classed('dcgan_sub_layer', true)
        .on('click', function(event, d){
            console.log(d)
            plot_state_update(d.state)
        })

    dcgan_sub_layer
        .append('rect')
        .attr("width", dcgan_x(sub_layer_width))
        .attr("height", function(d){
            // console.log(d)
            return dcgan_y(sub_layer_height / 3 * d.layers.length + 1)
        })
        .classed("custom-header", true)

    var dcgan_layers = dcgan_sub_layer.selectAll('g')
        .data(function(d){
            console.log(d)
            return d.layers
        })
        .enter()
        .append('g')
        .datum(function(d, i){ d['i'] = i; return d})

    dcgan_layers
        .selectAll('rect')
        .data(function(d){ 
            // console.log(d)
            return [d]
        })
        .enter()
        .append('rect')
        .attr('transform', function(d) {
            if (d.i == 0){
                shift_v = (dcgan_y(sub_layer_height) - 3*dcgan_y(layer_height))/2 - dcgan_y(1)
            }
            // console.log(d, index)
            res = 'translate(' + (dcgan_x(sub_layer_width) - dcgan_x(sub_layer_width - 15))/2 + 
            ',' + shift_v + ')'; 
            shift_v += dcgan_y(1) + (dcgan_y(layer_height))
            return res})
        .attr("width", dcgan_x(sub_layer_width - 15))
        .attr("height", dcgan_y(layer_height))
        .classed("custom-header", true)
        .on('click', function(event, d){
            console.log(d)
        })


    dcgan_layers
        .selectAll('text')
        .data(function(d){
            console.log(d)
            return [d]
        })
        .enter()
        .append('text')
        .attr('transform', function(d) {
            if (d.i == 0){
                shift_v = (dcgan_y(sub_layer_height) - 3*dcgan_y(layer_height))/2 - dcgan_y(1) + dcgan_y(layer_height) / 1.25
            }
            // console.log(d, index)
            res = 'translate(' + ((dcgan_x(sub_layer_width) - dcgan_x(sub_layer_width - 15))/2 + dcgan_x(sub_layer_width - 15)/2) +
            ',' + shift_v + ')'; 
            shift_v += dcgan_y(1) + (dcgan_y(layer_height))
            return res})
        .text(function(d){ return d.name})
            .classed('nn_text', true)
            .style("text-anchor", "middle")
            .on('click', function(event, d){
                console.log(d)
            })

    
    // dcgan_sub_layer
    //     .append('text')
    //     .text(function(d){
    //         return d.text
    //     })
    //     .attr('transform', function(d){
    //         res = 'translate(' + 
    //         x(nn_sub_block_width) / 2 + 
    //         ',' + 
    //         x(nn_sub_block_height) / 1.25 + 
    //         ')'

    //         return res
    //     })
    //     .classed('nn_text', true)
    //     .style("text-anchor", "middle")
}


function plot_layer_desc(layer){
    
}


function plot_states(state){
    // var rows = state[0].length;
    // var cols = rows

    window.plot_height = x(nn_block_height * 2) - x(nn_block_width)/2
    var plot_width = plot_height//x(nn_block_width) + 3 * stroke_rendered_width + stroke_rendered_margin
    var plot_x = 50.0 + x(stroke_block_width) + x(horisontal_margin)

    states_x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, (plot_width)])
    states_y = d3.scaleLinear()
        .domain([0, 100])
        .range([0, (plot_height)])

    
    var plot = svg
        .selectAll('.states')
        .data(state)
        .enter()
        .append('g')
        .attr('transform', function(d) { 
            return 'translate(' + plot_x + 
            ',' + (x(vertical_margin) + x(nn_block_height) + x(nn_block_width)/2) + ')'; })
        .attr('width', plot_width)
        .attr('height', plot_height)
        .classed("states", true)

    plot
        .append('rect')
        // .attr('transform', function(d) { 
        //     return 'translate(' + plot_x + 
        //     ',' + (x(vertical_margin) + x(nn_block_height) + x(nn_block_width)/2) + ')'; })
            .attr('width', plot_width)
            .attr('height', plot_height)
            .classed("custom-header", true)
    plot
        .append('g')
        .attr('width', plot_width)
        .attr('height', plot_height)
        .classed('states_heatmap', true)
    
    // plot_state_update(state)
}


function plot_state_update(state){
    // var size = d3.scaleLinear()
    //     .range([0, ])
    //     .domain([-1,1])
    var size_x = plot_height / state[0].length
    var size_y = plot_height / state[0][0].length
    var myColor = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([-1,1])
    var state_dicts = []
    for (var i = 0; i<state[0].length; i++){
        for (var j = 0; j<state[0][i].length; j++){
            state_dicts.push({'x': i * size_x, 'y': j * size_y, 'val': state[0][i][j]})
        }
    }
    console.log(state_dicts)

    var sh = svg.selectAll('.states_heatmap')
        .selectAll('rect')
        .data(state_dicts)
    sh
        .enter()
        .append("rect")
        .attr("x", function(d) { return (d.x) })
        .attr("y", function(d) { return (d.y) })
        .attr("width", size_x )
        .attr("height", size_y )
        .attr('text', state_dicts.length)
        // .classed("custom-header", true)
        .attr("fill", function(d) { return myColor(d.val)} )

    
    sh
        .attr("x", function(d) { return (d.x) })
        .attr("y", function(d) { return (d.y) })
        .attr("width", size_x )
        .attr("height", size_y )
        .attr('text', state_dicts.length)
        // .classed("custom-header", true)
        .attr("fill", function(d) { return myColor(d.val)} )

    
    sh.exit().remove()
}
