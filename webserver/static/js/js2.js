function plot_data(data){
    window.loaded = true
    window.stroke_desc_name = 'shape_before'
    window.current_step = 0
    window.current_epoch = 1
    window.general_info = {
        1: {'text': 'For each image we try to optimize shape, color and alpha parameters in a way to achieve good stroke\
                    for a current canvas. Progressive rendering means the follow: we start this a single canvas and generated\
                    strokes are broad brush for the background. <br><br>We set the number of stroke per each canvas to 3 (for this\
                    implementation, 9 in origin one); on each subsequent "epoch" (it is not real epoch like in machine learning)\
                    we split resulting canvas (1x1, 2x2, 3x3, 4x4, 5x5) and for each of them we generate additional new strokes.\
                    Final strokes parameters` for each canvas are saved before new epoch, so it is like real paining - layer by layer.\
                    <br><br>In summary: on the first epoch we have 3 strokes; on the second we have 3 (previous) + 3 * 4 (number of partial canvases);\
                    for the third one 3 + 3 * 4 + 3 * 16.'},

        2: {'text': 'Now we split canvas on 4 subplots and generate strokes parameters for each of them.\
                    In this visualization we show only first 3 of them (left-top subplot) to simplification.\
                    If on the first epoch we use clear canvas, now our canvases have previously painted strokes.\
                    Since we increase number of strokes paramters` to generate, it takes much more time to train.'},

        3: {'text': 'As you can see on the image under the reference - generated painting becomes more and more\
                    similar to our reference. Then we split canvas, each stroke becomes smaller and more precise.'},

        4: {'text': 'We are almost done here, realy close'},

        5: {'text': 'Final result: there are a lot of strokes from broad one to a small and precise.'}
    }

    
    window.svg = d3.select(".result")
        .append("svg")
        .attr("height", 2400)
        .attr('transform', 'translate(0, 10)')
        .attr("width", 2000)
        .append('g')
            .classed("svg", true)
            .classed("data_field", true)
    window.x = d3.scaleLinear()
        .domain([0, 300])
        .range([10, 1400])

    window.vertical_margin = 50
    window.horisontal_margin = 50
    window.stroke_block_width = 50
    window.stroke_block_height = 5
    window.stroke_block_height_margin = 10
    
    window.nn_block_width = 90
    window.nn_block_height = stroke_block_height * 3 + stroke_block_height_margin * 3
    window.nn_sub_block_width = nn_block_width * 0.8
    window.nn_sub_block_height = nn_block_height * 0.15
    window.nn_sub_block_height_margin = (nn_block_height - nn_sub_block_height * 2) / 5
    
    window.canvas_width = x(nn_block_height) / 2.6
    
    window.stroke_rendered_width = (canvas_width) / 2.5
    window.stroke_rendered_margin = ((canvas_width) - (2 * stroke_rendered_width))

    window.tooltip = d3.select('.result')
        .append("div")
        .classed('tooltip', true)
        .style("opacity", 0);
    
    window.tooltip_shapes_input = d3.select('.result')
        .append("div")
        .classed('tooltip_shapes', true)
        .style("opacity", 0);

    window.tooltip_shapes_output = d3.select('.result')
        .append("div")
        .classed('tooltip_shapes', true)
        .style("opacity", 0);

    window.tooltip_shapes_image = d3.select('.result')
        .append("div")
        .classed('tooltip_image', true)	
        .style("opacity", 0)

    tooltip_shapes_image.append('img')
        .classed('tooltip_image_img', true)
        .classed('tooltip_image', true)


    index = -1
    var stroke = svg
        .selectAll('.stroke')
        .data([{'text': 'Parameters of stroke shape, number of them depends on stroke type', 'name': 'shape_before', 'data': data_processed['shape_before']}, 
               {'text': 'Parameters of stroke color: RGB', 'name': 'color_before', 'data': data_processed['color_before']}, 
               {'text': 'Parameters of stroke alpha channel (transparency)', 'name': 'alpha_before', 'data': data_processed['alpha_before']}])
        .enter()
        .append('g')
        .attr('transform', function(d) {
            index += 1
            edge_height = x(stroke_block_height) + index * x((stroke_block_height + stroke_block_height_margin))
            return 'translate(' + x(horisontal_margin) + 
                ',' + (x(vertical_margin) + index * x((stroke_block_height + stroke_block_height_margin))) + ')'; })
        .classed("stroke", true)
        .on("click", function(event, d){
            console.log(d3.select(this))
            d3.selectAll('.stroke').selectAll('rect').classed('custom-header-selected', false)
            d3.select(this).selectAll('rect').classed('custom-header-selected', true)
            update_stroke_desc(d.name, data_processed)
        })
        .on("mousemove", function(event, d){
            // console.log(event)
            tooltip
                .style('opacity', 1.0);
            tooltip
                .html(d['text'] + '<br/> <br/> Click to see values')
                    .style("left", (event.layerX+ 15) + "px")		
                    .style("top", (event.layerY - 28) + "px")
                // .attr("left", event.layerX + "")		
                // .attr("top", event.layerY - 28 + "");
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
        .datum(function(d){ return d})
        .attr("height", x(stroke_block_height))
        .attr("width", x(stroke_block_width))
                .attr("rx", 6)
                .attr("ry", 6)
        .classed("custom-header", true)
        .classed("stroke_rect", true)

        window.sliderSimple = d3
        .sliderBottom()
        .min(1)
        .max(15)
        .width(x(200))
        .ticks(1)
        .step(1)
        .default(0)
        .on('onchange', val => {
            if (typeof data_processed != "undefined") {
                current_step = val - 1
                current_epoch = data_processed['grid'][current_step]
                update_stroke(data_processed)
                update_predict(data_processed)
                update_stroke_rendered(data_processed)
                plot_state_update_step()
                update_stroke_desc(stroke_desc_name, data_processed)

                // console.log(('Step: ' + current_step + 'Number of canvases: ' + current_epoch * current_epoch + '' + general_info[current_epoch]['text']))
                d3.select('.layer_desc').select('#desc_text').html(("" + 'Step: ' + current_step + "<br>" +
                "" + 'Number of canvases: ' + current_epoch * current_epoch + "<br>" + 
                "" + general_info[current_epoch]['text'] + ""))
                // "<tspan x='0' dy='1.2em'>" + "</tspan>"
            }
            
        });
    
    window.gSimple = svg
        .append('g')
        .attr('transform', function(d) { 
            return 'translate(' + (x(200) - x(300) / 2) + 
            ',' + (edge_height + x(vertical_margin) + 25) + ')'; })

    gSimple.call(sliderSimple);

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
        .selectAll('.nn')
        .data([{'text': 'Neural network architecture (high level abstraction) used for stroke parameters searching', 'input_shape': 'None; 1; 10', 'output_shape': 'None; 32; 32; 3'}])
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
                // console.log(d)
            })
            .on("mousemove", function(event, d){
                // console.log(event, d)
                // console.log(d3.pointer(event))
                tooltip
                    .style('opacity', 1.0);
                tooltip
                    .html(d['text'])
                    // .style("left", (event.layerX - d3.pointer(event)[0]) + "px")		
                    // .style("top", (event.layerY - d3.pointer(event)[1]) + "px")
                    .style("left", (event.layerX + 15) + "px")
                    .style("top", (event.layerY - 28) + "px")

                tooltip_shapes_input
                    .style('opacity', 1.0);
                tooltip_shapes_input
                    .html(d['input_shape'])
                    .style("left", (event.layerX - d3.pointer(event)[0]) + "px")
                    .style("top", (event.layerY - d3.pointer(event)[1] - 27) + "px")
                
                tooltip_shapes_output
                    .style('opacity', 1.0);
                tooltip_shapes_output
                    .html(d['output_shape'])
                    .style("left", (event.layerX - d3.pointer(event)[0]) + "px")
                    .style("top", (edge_height + event.layerY - d3.pointer(event)[1] + 3) + "px")
                
            })
            .on("mouseout", function(d) {		
                tooltip
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);			
                tooltip_shapes_input	
                    .style("opacity", 0);		
                tooltip_shapes_output	
                    .style("opacity", 0);
            })

    var data = {
        'dcgan_plot': [{'text': 'Generate color of each pixel of new image according to input strokes parameters'}],
        'dcgan_sub_layer': [{'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d', 'input_shape': 'None; 1; 10', 'output_shape': 'None; 4; 4, 512'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}], 'state': [[[0,1,2]]]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d', 'input_shape': 'None; 4; 4; 512', 'output_shape': 'None; 32; 32, 256'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}], 'state': [[[0,1,2]]]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d', 'input_shape': 'None; 32; 32, 256', 'output_shape': 'None; 128; 128; 128'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}], 'state': [[[0,1,2]]]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input', 'layers': [{'name': 'ConvTranspose2d', 'input_shape': 'None; 128; 128, 128', 'output_shape': 'None; 256; 256; 3'}]}]
    }
    var nn_sub = nn
        .selectAll('.nn_sub')
        .data([{'text': 'DCGAN', '_text': ': shading network<br>Click to see architecture'}, {'text': 'PixelShuffle', '_text': ': rasterization network<br>Click to see architecture'}])
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
            .on("mousemove", function(event, d){
                // console.log(event)
                tooltip
                    .style('opacity', 1.0);
                tooltip
                    .html(d['text'] + d['_text'])
                    .style("left", (event.layerX+ 15) + "px")		
                    .style("top", (event.layerY - 28) + "px")
                    // .attr("left", event.layerX + "")		
                    // .attr("top", event.layerY - 28 + "");
            })
            .on("mouseout", function(d) {		
                tooltip
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);	
            })
            .on("click", function(event, d){
                console.log(d)
                d3.selectAll('.nn_sub').selectAll('rect').classed('custom-header-selected', false)
                d3.select(this).selectAll('rect').classed('custom-header-selected', true)
                if (d.text == 'DCGAN'){
                    d3.selectAll('.dcgan_plot').remove()
                    var data_to_plot = {
                        'dcgan_plot': [{'text': 'Generate color of each pixel of new image according to input strokes parameters'}],
                        'dcgan_sub_layer': [{'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [
                            {'name': 'ConvTranspose2d', 'input_shape': 'None; 1; 10', 'output_shape': 'None; 4; 4, 512'}, 
                            {'name': 'BatchNormalization'}, 
                            {'name': 'ReLU'}], 
                            'state': [[[0,1,2]]]},
                        {'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [
                            {'name': 'ConvTranspose2d', 'input_shape': 'None; 4; 4; 512', 'output_shape': 'None; 32; 32, 256'}, 
                            {'name': 'BatchNormalization'}, 
                            {'name': 'ReLU'}], 'state': [[[0,1,2]]]},
                        {'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [
                            {'name': 'ConvTranspose2d', 'input_shape': 'None; 32; 32, 256', 'output_shape': 'None; 128; 128; 128'}, 
                            {'name': 'BatchNormalization'}, 
                            {'name': 'ReLU'}], 'state': [[[0,1,2]]]},
                        {'type': 'convT', '_text': 'Deconvolution - increases shape of input', 'layers': [{'name': 'ConvTranspose2d', 'input_shape': 'None; 128; 128, 128', 'output_shape': 'None; 256; 256; 3'}]}]
                    }
                    var dcgan_states_tmp = d3.selectAll('.dcgan_sub_layer').data()
                    for (var i = 0; i < data_to_plot['dcgan_sub_layer'].length; i++){
                        data_to_plot['dcgan_sub_layer_states'] = data_processed['states']
                    }
                
                    draw_dcgan(data_to_plot)

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
            .on("mousemove", function(event, d){
                // console.log(event)
                // console.log(d3.select('#image_canvas_pattern_image').attr('xlink:href'))
                tooltip
                    .style('opacity', 1.0);
                tooltip_shapes_image
                    .style('opacity', 1.0);
                    tooltip
                    .style("left", (event.layerX+ 15) + "px")
                    .style("top", (event.layerY - 28) + "px")
                tooltip_shapes_image
                    .style("left", (event.layerX+ 15) + "px")
                    .style("top", (event.layerY + 28) + "px")
                tooltip_shapes_image
                    .select('img')
                    .attr('src', d3.select('#image_canvas_pattern_image').attr('xlink:href'))
                    // .attr("left", event.layerX + "")		
                    // .attr("top", event.layerY - 28 + "");
                
                tooltip
                    .html('Reference image which we want to paint')
            })
            .on("mouseout", function(d) {		
                tooltip
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);		
                tooltip_shapes_image
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);	
            })

    d3.select('.data_field')
        .append("defs")
        .append("pattern")
        .attr("height", d3.select('#image_canvas').attr('height'))
        .attr("width", d3.select('#image_canvas').attr('width'))
        .attr('patternUnits', "userSpaceOnUse")
        .attr("id", "image_canvas_pattern")
            .append("image")
            .attr("height", d3.select('#image_canvas').attr('height'))
            .attr("width", d3.select('#image_canvas').attr('width'))
            // .attr("xlink:href", "none")
            .attr('id', 'image_canvas_pattern_image')
    
    var predict = svg
        .append('g')
        .selectAll('#predict_canvas')
        .data([{'text': 'Painted image'}])
        .enter()
            .append('rect')
            .attr("height", (canvas_width))
            .attr("width", (canvas_width))
            .attr('transform', function(d) { 
                return 'translate(' + (50.0 + edge_width + x(horisontal_margin)) + 
                ',' + (x(vertical_margin)) + ')'; })
            .attr('id', "predict_canvas")
            .classed("custom-header", true)
            .on("click", function(event, d){
                // console.log(d)
            })
            .on("mousemove", function(event, d){
                // console.log(event)
                // console.log(d3.select('#predict_canvas').attr('xlink:href'))
                tooltip
                    .style('opacity', 1.0); 
                tooltip_shapes_image
                    .style('opacity', 1.0);

                tooltip
                    .style("left", (event.layerX+ 15) + "px")
                    .style("top", (event.layerY - 28) + "px")
                tooltip_shapes_image
                    .style("left", (event.layerX+ 15) + "px")
                    .style("top", (event.layerY + 28) + "px")
                tooltip_shapes_image
                    .select('img')
                    .attr('src', d3.select('#predict_canvas_pattern_image').attr('xlink:href'))
                    // .attr("left", event.layerX + "")		
                    // .attr("top", event.layerY - 28 + "");
                
                tooltip
                    .html('Current resulting painting')
            })
            .on("mouseout", function(d) {		
                tooltip
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);	
                tooltip_shapes_image
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);	
            })

    d3.select('.data_field')
        .append("defs")
        .append("pattern")
        .attr("height", d3.select('#image_canvas').attr('height'))
        .attr("width", d3.select('#image_canvas').attr('width'))
        .attr('patternUnits', "userSpaceOnUse")
        .attr("id", "predict_canvas_pattern")
            .append("image")
            .attr("height", d3.select('#image_canvas').attr('height'))
            .attr("width", d3.select('#image_canvas').attr('width'))
            // .attr("xlink:href", "none")
            .attr('id', 'predict_canvas_pattern_image')

    index = -1
    var stroke_rendered = svg
        .append('g')
        .selectAll('.stroke_rendered')
        .data([{'text': 'Stroke visualization', 'i': 0}, {'text': 'Stroke visualization', 'i': 1}, {'text': 'Stroke visualization', 'i': 2}])
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
                // console.log(d)
            })
            .on("mousemove", function(event, d, i){
                // console.log(d)
                // console.log(d3.select('#image_canvas_pattern_image').attr('xlink:href'))
                tooltip
                .style('opacity', 1.0);
                tooltip_shapes_image
                    .style('opacity', 1.0);

                    tooltip
                    .style("left", (event.layerX+ 15) + "px")
                    .style("top", (event.layerY - 28) + "px")
                tooltip_shapes_image
                    .style("left", (event.layerX+ 15) + "px")
                    .style("top", (event.layerY + 28) + "px")
                tooltip_shapes_image
                    .select('img')
                    .attr('src', d3.select('#stroke_rendered_pattern_image_' + d.i).attr('xlink:href'))
                    // .attr("left", event.layerX + "")		
                    // .attr("top", event.layerY - 28 + "");
                
                    tooltip
                    .html('Example of stroke rendered on this step')
            })
            .on("mouseout", function(d) {		
                tooltip
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);	
                tooltip_shapes_image
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);	
            })


    for (var i = 0; i < 3; i++){
        d3.select('.data_field')
            .append("defs")
            .append("pattern")
            .attr("height", d3.select('.stroke_rendered').attr('height'))
            .attr("width", d3.select('.stroke_rendered').attr('width'))
            .attr('patternUnits', "userSpaceOnUse")
            .attr("id", "stroke_rendered_pattern_" + i)
                .append("image")
                .attr("height", d3.select('.stroke_rendered').attr('height'))
                .attr("width", d3.select('.stroke_rendered').attr('width'))
                // .attr("xlink:href", "none")
                .attr('id', 'stroke_rendered_pattern_image_' + i)
    }

    var loss = svg.append('g')
        .attr('id', 'loss')
        .attr('transform', 'translate(' + (50.0 + edge_width + x(horisontal_margin)) + ',' + (x(vertical_margin) - (2 * canvas_width / 3)) +  ')')
        .attr("width", (canvas_width))
        .attr("height", (canvas_width)/3)
        .on("mousemove", function(event, d, i){
            // console.log(d)
            // console.log(d3.select('#image_canvas_pattern_image').attr('xlink:href'))
            tooltip
                .style('opacity', 1.0)
                .style("left", (event.layerX+ 15) + "px")
                .style("top", (event.layerY - 28) + "px")
                .html('Loss function used to optimize current stroke parameters. This paper propose usage of Sinkhorn distance in order to avoid zero-gradient problem: if generated stroke A is not overlap with expected\
                stroke B, loss is constant, which leads to zero-gradient and training problems. Nevertheless they remains classic pixel-wise error. They use them in conjection with some regularizers.')
            // tooltip_shapes_image
            //     .attr('src', d3.select('#stroke_rendered_pattern_image_' + d.i).attr('xlink:href'))
            //     // .attr("left", event.layerX + "")		
            //     // .attr("top", event.layerY - 28 + "");
        })
        .on("mouseout", function(d) {		
            tooltip
                // .transition()		
                // .duration(500)		
                .style("opacity", 0);	
        })

    loss
        .append('rect')
        .attr("width", (canvas_width))
        .attr("height", (canvas_width)/3)
        .classed('custom-header', true)

    loss
        .append('text')
        .text('Loss')
        .attr('y', (canvas_width)/3/1.25)
        .attr('x', (canvas_width)/2)
        .style("text-anchor", "middle")
        .classed('nn_text', true)




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
        .append('g')

    draw_arrow(arrows, 
        [{
            'x': Number(Array.from(loss._groups[0][0].attributes[1].nodeValue.matchAll(pattern))[0][0]) + (canvas_width) / 2,
            'y': Number(Array.from(loss._groups[0][0].attributes[1].nodeValue.matchAll(pattern))[1][0]), 
        }, 
        {
            'x': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + (canvas_width) / 2,
            'y': Number(Array.from(image._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]) + (canvas_width), 
        }, ]  , 0
    )

    draw_arrow(arrows, 
        [{
            'x': Number(Array.from(loss._groups[0][0].attributes[1].nodeValue.matchAll(pattern))[0][0]) + (canvas_width) / 2,
            'y': Number(Array.from(loss._groups[0][0].attributes[1].nodeValue.matchAll(pattern))[1][0]) + (canvas_width)/3, 
        }, 
        {
            'x': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + (canvas_width) / 2,
            'y': Number(Array.from(predict._groups[0][0].attributes[2].nodeValue.matchAll(pattern))[1][0]), 
        }, ]  , 0
    )

    console.log(nn._groups)
    for (var i=0; i<stroke._groups[0].length; i++){
        draw_arrow(arrows, 
            [
            {
                'x': Number(Array.from(nn._groups[0][0].childNodes[0].attributes[2].nodeValue.matchAll(pattern))[0][0]),
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
            'x': Number(Array.from(nn._groups[0][0].childNodes[0].attributes[2].nodeValue.matchAll(pattern))[0][0]) + x(nn_block_width),
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
            'y': Number(Array.from(loss._groups[0][0].attributes[1].nodeValue.matchAll(pattern))[1][0]) + (canvas_width)/3/2, 
        },
        {
            'x': Number(Array.from(loss._groups[0][0].attributes[1].nodeValue.matchAll(pattern))[0][0]),
            'y': Number(Array.from(loss._groups[0][0].attributes[1].nodeValue.matchAll(pattern))[1][0]) + (canvas_width)/3/2, 
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
    window.selected_nn_sub_block = 0
    // console.log('WW')
    var dcgan_width = x(stroke_block_width)// + x(stroke_block_width) + 50
    var dcgan_height = x(nn_block_height * 3)

    var sub_layer_width = 100
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
            ',' + (x(vertical_margin) + x(nn_block_height) + 25) + ')'; })
        .classed('dcgan_plot', true)

    plot
        .append('rect')
        .attr("width", dcgan_x(100))
        .attr("height", dcgan_y(100))
        .attr("rx", 6)
        .attr("ry", 6)
        .classed("custom-header-simple", true)

    shift_v = dcgan_y(0)
    var dcgan_sub_layer = plot
        .selectAll('.dcgan_sub_layer')
        .data(data['dcgan_sub_layer'])
        .enter()
        .append('g')
        .attr('transform', function(d, index) { 
            // console.log(d, index)
            res = 'translate(' + dcgan_x(0) + 
            ',' + shift_v + ')'; 
            shift_v += dcgan_y(10) + (dcgan_y(sub_layer_height))
            return res})
        .datum(function(d, i){
            // console.log(d, i)
            let state = []
            for (var j = 0; j < data['dcgan_sub_layer_states'].length; j++){
                state.push(data['dcgan_sub_layer_states'][j]['dcgan'][i])
            }
            d.i = i
            d.state = state
            // d.layers = d
            return d
        })
        .classed('dcgan_sub_layer', true)
        .on('click', function(event, d, i){
            // console.log(event, d)
            d3.selectAll('.dcgan_sub_layer').selectAll('rect').classed('custom-header-selected', false)
            d3.select(this).selectAll('.sub_layer').classed('custom-header-selected', true)
            plot_state_update(d.state, d.i)
        })
        .on("mousemove", function(event, d){
            // console.log(event, d)
            // console.log(d3.pointer(event))

            tooltip_shapes_input
                .style('opacity', 1.0);
            tooltip_shapes_input
                .html(d.layers[0]['input_shape'])
                .style("left", (event.layerX - d3.pointer(event)[0]) + "px")
                .style("top", (event.layerY - d3.pointer(event)[1] - 27) + "px")
            
            tooltip_shapes_output
                .style('opacity', 1.0);
            tooltip_shapes_output
                .html(d.layers[0]['output_shape'])
                .style("left", (event.layerX - d3.pointer(event)[0]) + "px")
                .style("top", (dcgan_y(sub_layer_height / 3 * d.layers.length + 1) + event.layerY - d3.pointer(event)[1] + 2) + "px")
            
        })
        .on("mouseout", function(d) {		
            tooltip
                // .transition()		
                // .duration(500)		
                .style("opacity", 0);			
            tooltip_shapes_input	
                .style("opacity", 0);		
            tooltip_shapes_output	
                .style("opacity", 0);
        })

    dcgan_sub_layer
        .append('rect')
        .datum(function(d){ return d})
        // .attr('')
        .attr("width", dcgan_x(sub_layer_width))
        .attr("height", function(d){
            // console.log(d)
            return dcgan_y(sub_layer_height / 3 * d.layers.length + 1)
        })
        .attr("rx", 6)
        .attr("ry", 6)
        .classed("custom-header", true)
        .classed("sub_layer", true)


    window.layers_desc = {'ConvTranspose2d': {'text': 
    'Applies a 2D transposed convolution operator over an' +
    'input image composed of several input planes.' +
    'This module can be seen as the gradient of Conv2d'  +
    'with respect to its input. It is also known as a'  +
    'fractionally-strided convolution or a deconvolution'  +
    '(although it is not an actual deconvolution operation).'},
    'BatchNormalization': {'text': 
    'Applies Batch Normalization over a 4D input (a'  +
    'mini-batch of 2D inputs with additional channel'  +
    'dimension) as described in the paper Batch'  +
    'Normalization: Accelerating Deep Network Training'  +
    'by Reducing Internal Covariate Shift.'},
    'ReLU': {'text': 
        "Applies the rectified linear unit function element-wise:\
         ReLU(x)=(x)+=max⁡(0,x)\text{ReLU}(x) = (x)^+ = \max(0, x)"
        }}

    var dcgan_layers = dcgan_sub_layer.selectAll('g')
        .data(function(d){
            // console.log(d)
            return d.layers
        })
        .enter()
        .append('g')
        .datum(function(d, i){ d['i'] = i; return d})
        .on('click', function(event, d){
            // console.log(d)
            plot_layer_desc_update(d.name)
        })
        .on("mousemove", function(event, d){
            // console.log(d)
            tooltip
                .style('opacity', 1.0);
            tooltip
                .html(d['name'] + ': ' + layers_desc[d.name]['text'])
                .style("left", (event.layerX+ 15) + "px")		
                .style("top", (event.layerY - 28) + "px")
                // .attr("left", event.layerX + "")		
                // .attr("top", event.layerY - 28 + "");
        })
        .on("mouseout", function(d) {		
            tooltip
                // .transition()		
                // .duration(500)		
                .style("opacity", 0);	
        })

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
            // console.log(d)
        })


    dcgan_layers
        .selectAll('text')
        .data(function(d){
            // console.log(d)
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
                // console.log(d)
            })
            .on("mousemove", function(event, d){
                // console.log(d)
                tooltip
                    .style('opacity', 1.0);
                tooltip
                    .html(d['name'])
                    .style("left", (event.layerX+ 15) + "px")		
                    .style("top", (event.layerY - 28) + "px")
                    // .attr("left", event.layerX + "")		
                    // .attr("top", event.layerY - 28 + "");
            })
            .on("mouseout", function(d) {		
                tooltip
                    // .transition()		
                    // .duration(500)		
                    .style("opacity", 0);	
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


function plot_states(state){
    // console.log('SSSS')
    // var rows = state[0].length;
    // var cols = rows

    window.plot_height = x(nn_block_height * 3) - x(nn_block_width)/2
    window.plot_width = x(nn_block_width) + 3 * stroke_rendered_width + 2*stroke_rendered_margin
    var plot_x = 50 + x(horisontal_margin) + x(stroke_block_width)

    states_x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, (plot_width)])
    states_y = d3.scaleLinear()
        .domain([0, 100])
        .range([0, (plot_height)])

    var plot = svg
        .append('g')
        .attr('transform', function(d) { 
            return 'translate(' + plot_x + 
            ',' + (x(vertical_margin) + x(nn_block_height) + x(nn_block_width)/1.5) + ')'; })
        .attr('width', plot_width)
        .attr('height', plot_height)
        .classed("states", true)
    console.log(plot)

    plot.append('g')
        .attr('height', plot_height-20)
        .attr('transform', function(d) {return 'translate(0, 10)'})
        .classed('states_heatmap', true)
    
    plot.append('text')
        .classed('states_text', true)
        .classed('nn_text', true)
        .text('')


    // plot
    //     .append('rect')
    //     // .attr('transform', function(d) { 
    //     //     return 'translate(' + plot_x + 
    //     //     ',' + (x(vertical_margin) + x(nn_block_height) + x(nn_block_width)/2) + ')'; })
    //         .attr('width', plot_width)
    //         .attr('height', plot_height)
    //         .classed("custom-header", true)
    // plot
    //     .append('g')
    //     .attr('width', plot_width)
    //     .attr('height', plot_height)
    //     .classed('states_heatmap', true)
    
    // plot_state_update(state)
}


function plot_state_update(state, block_number){
    // var size = d3.scaleLinear()
    //     .range([0, ])
    //     .domain([-1,1])
    d3.select('.states').select('text').text(function(d){
        return 'Output values of layer block (first feature channel): ' + (block_number + 1)
    })

    var size_x = plot_width / state[current_step][0].length
    var size_y = plot_height / state[current_step][0][0].length
    var myColor = d3.scaleLinear()
        .range(['#9eacc9', "#491d88"])
        .domain([-1,1])
    var state_dicts = []
    for (var i = 0; i<state[current_step][0].length; i++){
        for (var j = 0; j<state[current_step][0][i].length; j++){
            let tmp = [];
            for (k in state){
                tmp.push(state[k][0][i][j]);
            }
            // console.log(tmp)
            state_dicts.push({'x': i * size_x, 'y': j * size_y, 'val': tmp})
        }
    }
    // console.log(state_dicts)

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
        .attr("fill", function(d) { return myColor(d.val[current_step])} )

    
    sh
        .attr("x", function(d) { return (d.x) })
        .attr("y", function(d) { return (d.y) })
        .attr("width", size_x )
        .attr("height", size_y )
        .attr('text', state_dicts.length)
        // .classed("custom-header", true)
        .attr("fill", function(d) { return myColor(d.val[current_step])} )

    
    sh.exit().remove()
}

function plot_state_update_step(){
    var myColor = d3.scaleLinear()
        .range(['#9eacc9', "#491d88"])
        .domain([-1,1])
    var sh = svg.selectAll('.states_heatmap')
        .selectAll('rect')
        // .data(state_dicts)

    sh
        .attr("fill", function(d) { return myColor(d.val[current_step])} )

}

//
function plot_layer_desc(){

    window.layer_desc_height = x(nn_block_width)/2 - 10
    window.layer_desc_width = x(nn_block_width) + 3 * stroke_rendered_width + 2*stroke_rendered_margin
    var layer_desc_x = 50 + x(horisontal_margin) + x(stroke_block_width)
    var layer_desc_y = x(vertical_margin) + x(nn_block_height)

    // states_x = d3.scaleLinear()
    //     .domain([0, 100])
    //     .range([0, (plot_width)])
    // states_y = d3.scaleLinear()
    //     .domain([0, 100])
    //     .range([0, (plot_height)])

    var plot = svg
        .append('g')
        .attr('transform', function(d) { 
            return 'translate(' + layer_desc_x + 
            ',' + layer_desc_y + ')'
        })
        .attr('width', layer_desc_width)
        .style('max-width', layer_desc_width)
        .attr('height', layer_desc_height)
        .classed("layer_desc", true)

    // plot
    //     .append('rect')
    //     .attr('width', layer_desc_width)
    //     .attr('height', layer_desc_height)
    //     .classed("custom-header", true)

    plot.append('foreignObject')
        .attr('width', layer_desc_width)
        .attr('height', layer_desc_height)
        .attr('transform', function(d) { 
            return 'translate(' + 5 + 
            ',' + 18 + ')'
        })
        .classed('nn_text', true)
        .append("xhtml:body")
        .html('<div id="desc_text" class="nn_text" style="overflow-y: auto; height:' + layer_desc_height + 'px; width:' + layer_desc_width + 'px"></div>')
}


function plot_stroke_desc(){
    var plot_input = svg
        .append('g')
        .attr('width', x(horisontal_margin)/1.5)
        .attr('height', x(stroke_block_height) + 2 * x((stroke_block_height + stroke_block_height_margin)))
        .attr('transform', function(d) { 
            return 'translate(' + 0 + 
            ',' + x(vertical_margin) + ')'
        })
        .classed('input_desc', true)
    // plot_input
    //     .append('text')
    //     .attr('x', x(horisontal_margin)/2)
    //     .attr('y', x(stroke_block_height) + 2 * x((stroke_block_height + stroke_block_height_margin)) / 2)
    //     .text('Strokes values')

    plot_input
            .append('g')
            .attr('height', x(stroke_block_height) + 2 * x((stroke_block_height + stroke_block_height_margin)))
            .attr('transform', function(d) { 
                return 'translate(' + 0 + 
                ',' + 0 + ')'
            })
            .classed('stroke_heatmap', true)
            // .append('rect')
            // .attr('width', x(horisontal_margin)/2)
            // .attr('height', x(stroke_block_height) + 2 * x((stroke_block_height + stroke_block_height_margin)))
            // .classed("custom-header", true)

        


}

function update_stroke_desc(name, data){
    stroke_desc_name = name
    var desc = {'shape_before': 'Number of columns: number of strokes to show<br> Rows: shape described as quadratic Bezier curve<br> x_0, y_0, x_1, y_1, x_2, y_2(control points),<br> r_0, r_2(thickness);',
                'color_before': 'Number of columns: number of strokes to show<br> Rows: color<br> R_0, G_0, B_0(color of point 0),<br> R_1, G_1, B_1(color of point 2)',
                'alpha_before': 'Number of columns: number of strokes to show<br> Rows: A (alpha channel)'}
    // console.log(name, data)
    var data_stroke = data[name]
    var width = x(horisontal_margin)/2 / 3
    // console.log(data_stroke[0][0].length)
    var height = (x(stroke_block_height) + 2 * x((stroke_block_height + stroke_block_height_margin))) / data_stroke[0][0][0].length
    var myColor = d3.scaleLinear()
        .range(['#9eacc9', "#491d88"])
        .domain([-1,1])

    var state_dicts = []
    for (var i = 0; i<data_stroke[current_step][0].length; i++){
        for (var j = 0; j<data_stroke[current_step][0][i].length; j++){
            let tmp = [];
            for (k in data_stroke){
                tmp.push(data_stroke[k][0][i][j]);
            }
            // console.log(tmp)
            state_dicts.push({'x': i * width, 'y': j * height, 'val': tmp})
        }
    }
    console.log(state_dicts)
    var plot = svg
        .select('.stroke_heatmap')
        .selectAll('rect')
        .data(state_dicts)

    plot
        .enter()
        .append("rect")
        .attr("x", function(d) { return (d.x) })
        .attr("y", function(d) { return (d.y) })
        .attr("width", width )
        .attr("height", height )
        // .attr('text', state_dicts.length)
        // .classed("custom-header", true)
        .attr("fill", function(d) { return myColor(d.val[current_step])} )
        .on("mousemove", function(event, d){
            // console.log(d)
            tooltip
                .style('opacity', 1.0);
            tooltip
                .html(desc[name])
                .style("left", (event.layerX+ 15) + "px")		
                .style("top", (event.layerY - 28) + "px")
                // .attr("left", event.layerX + "")		
                // .attr("top", event.layerY - 28 + "");
        })
        .on("mouseout", function(d) {		
            tooltip
                // .transition()		
                // .duration(500)		
                .style("opacity", 0);	
        })

    
    plot
        .attr("x", function(d) { return (d.x) })
        .attr("y", function(d) { return (d.y) })
        .attr("width", width )
        .attr("height", height )
        .attr('text', state_dicts.length)
        // .classed("custom-header", true)
        .attr("fill", function(d) { return myColor(d.val[current_step])} )
        .on("mousemove", function(event, d){
            // console.log(d)
            tooltip
                .style('opacity', 1.0);
            tooltip
                .html(desc[name])
                .style("left", (event.layerX+ 15) + "px")		
                .style("top", (event.layerY - 28) + "px")
                // .attr("left", event.layerX + "")		
                // .attr("top", event.layerY - 28 + "");
        })
        .on("mouseout", function(d) {		
            tooltip
                // .transition()		
                // .duration(500)		
                .style("opacity", 0);	
        })

    
    plot.exit().remove()
}