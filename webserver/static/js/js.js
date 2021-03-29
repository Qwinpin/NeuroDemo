async function upload_image(key) {
    let rand_id = Math.floor(Math.random() * Math.floor(100000));
    localStorage.setItem('id', rand_id)

    const e = document.getElementById('image').files[0];

    // var x = document.getElementById('origin_image')
    // x.setAttribute('src', URL.createObjectURL(e))
    // x.setAttribute('width', 256)
    // x.setAttribute('height', 256)
    update_image(URL.createObjectURL(e))

    let data = new FormData()
    data.append('image', e)

    console.log('http://localhost:9000/file=' + rand_id + '?key=' + key)

    if (key == 'paint'){
        await fetch('http://localhost:9000/file=' + rand_id + '?key=' + key + '&num=' + 3, {
            method: 'POST',
            mode: 'cors',
            headers: {
            //   'content-type': 'multipart/form-data'
                'Access-Control-Allow-Origin': '*'
            },
            body: data
        }).then(response => response.json())
            .then(response => {
                var dct = response['r']
                // for (var i = 0; i < dct.length; i++){
                //     dct[i]['painting'] = array2img(dct[i]['painting'])

                //     for (var j = 0; j < dct[i]['strokes_before'].length; j++){
                //         dct[i]['strokes_before'][j] = array2img(dct[i]['strokes_before'][j])
                //     }

                //     for (var j = 0; j < dct[i]['strokes_after'].length; j++){
                //         dct[i]['strokes_after'][j] = array2img(dct[i]['strokes_after'][j])
                //     }
                // }
                // let data = array2img(response['r'][0]['painting'])
                window.data_processed = dct
                console.log(dct)
                update_stroke(data_processed)
                update_predict(data_processed)
                // plot_data(dct)

                // var x = document.getElementById('resulting_image')
                // x.setAttribute('src', dct[0]['painting'])
                // var x = document.getElementById('resulting_image')
                // x.textContent = JSON.stringify(response, undefined, 4)
            })
    } else{

        await fetch('http://localhost:9000/file=' + rand_id + '?key=' + key, {
            method: 'POST',
            mode: 'cors',
            headers: {
            //   'content-type': 'multipart/form-data'
                'Access-Control-Allow-Origin': '*'
            },
            body: data
        }).then(
            response => response.blob())
            .then(image => {
                outside = URL.createObjectURL(image)

                var x = document.getElementById('resulting_image')
                x.setAttribute('src', outside)
            }
        )
    }
}

// async function upload_audio() {
//     let rand_id = Math.floor(Math.random() * Math.floor(100000));
//     localStorage.setItem('id', rand_id)

//     const e = document.getElementById('image').files[0];
//     let data = new FormData()
//     data.append('image', e)

//     await fetch('http://localhost:9055/audio=' + rand_id, {
//         method: 'POST',
//         headers: {
//         //   'content-type': 'multipart/form-data'
//         },
//         body: data
//     }).then(
//         response => {
//             var x = document.getElementById('method_request_button')
//             if (x.style.display === "none") {
//                 x.style.display = "block";
//             }
//         }
// }


async function make_request(method_id){
    let rand_id = localStorage.getItem('id')
    
    if (method_id == 'test'){
        await fetch('http://0.0.0.0:9050/id=' + rand_id, {
            method: 'GET',
            mode: 'cors',
            headers: {
            //   'content-type': 'multipart/form-data'
            'Access-Control-Allow-Origin': '*'
            }
    }).then(data => {
        data = data.blob()
        var x = document.getElementById('resulting_image')
        x.setAttribute('src', data)
    })
    }
}

function array2img(array){
    var width = array[0].length,
    height = array.length,
    buffer = new Uint8ClampedArray(width * height * 4); // have enough bytes
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            var pos = (y * width + x) * 4; // position in buffer based on x and y
            buffer[pos  ] = array[y][x][0]           // some R value [0, 255]
            buffer[pos+1] = array[y][x][1]           // some G value
            buffer[pos+2] = array[y][x][2];           // some B value
            buffer[pos+3] = 255;           // set alpha channel
        }
    }
    
    var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // create imageData object
    var idata = ctx.createImageData(width, height);

    // set our buffer as source
    idata.data.set(buffer);

    // update canvas with new data
    ctx.putImageData(idata, 0, 0);

    let dataUri = canvas.toDataURL()
    return dataUri
}


function update_image(data){
    d3.select('#bg_image_canvas')
        .attr("xlink:href", data)

    // console.log(d3.selectAll('#image_canvas')._groups[0][1])
    d3.selectAll('#image_canvas')
        .attr('fill', "url(#bg)")
        .style('fill', "url(#bg)")
}

function update_predict(data){
    console.log(current_step)
    // response['r']
    var image = array2img(data['painting'][current_step])
    d3.select('#predict_canvas')
        .attr("xlink:href", image)

    // console.log(d3.selectAll('#image_canvas')._groups[0][1])
    d3.selectAll('#predict')
        .attr('fill', "url(#predicted_image)")
        .style('fill', "url(#predicted_image)")
}

function update_stroke(data){
    d3.selectAll('.stroke')
        .data([{'text': 'Parameters of stroke shape, number of them depends on **stroke** type', 
                'value': data['shape_before'][current_step]}, 
        {'text': 'Parameters of stroke color: RGB', 
        'value': data['color_before'][current_step]}, 
        {'text': 'Parameters of stroke alpha channel (transparency)', 
        'value': data['alpha_before'][current_step]}])

    // console.log(d3.selectAll('.dcgan_sub_layer').data())
    var data_to_plot = {
        'dcgan_plot': [{'text': 'Generate color of each pixel of new image according to input strokes parameters'}],
        'dcgan_sub_layer': [{'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input + BatchNormalization + ReLU', 'layers': [{'name': 'ConvTranspose2d'}, {'name': 'BatchNormalization'}, {'name': 'ReLU'}]},
        {'type': 'convT', '_text': 'Deconvolution - increases shape of input', 'layers': [{'name': 'ConvTranspose2d'}]}]
    }
    var dcgan_states_tmp = d3.selectAll('.dcgan_sub_layer').data()
    for (var i = 0; i < data_to_plot['dcgan_sub_layer'].length; i++){
        data_to_plot['dcgan_sub_layer'][i]['state'] = data['states'][current_step]['dcgan'][i]
    }

    draw_dcgan(data_to_plot)
    d3.selectAll('.dcgan_sub_layer')
        .data(data_to_plot['dcgan_sub_layer'])

    d3.selectAll('.dcgan_sub_layer')
        .data(data_to_plot['dcgan_sub_layer'])
    // console.log(dcgan_states_tmp)
    // d3.selectAll('.dcgan_sub_layer')
    //     .data(dcgan_states_tmp)
    //     .enter()
    //     .append('g')
    //     .on('click', function(event, d){
    //         console.log(1, d)
    //     })

}








function _plot_data(data){
    var svg = d3.select(".result")
        .append("svg")
            .attr("height", 1200)
            .attr("width", 800)
            .classed("svg", true)
            .classed("data_field", true)

    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([20, svg.attr('width') - 20])

    var canvas_width = 25;
    var canvas_height = 25;
    var canvas_w_shift = 5;
    var canvas_h_shift = 5;

    var strokes_width = 10;
    var strokes_w_shift = 10

    var network_height = 20
    
    var w_space = 5
    var h_space = 5

    var current_step = 0


    var sliderSimple = d3
    .sliderBottom()
    .min(0)
    .max(data['painting'].length - 2)
    .width(800)
    .ticks(5)
    .step(1)
    .default(0)
    .on('onchange', val => {
        update(data, val)
    });

    var gSimple = svg
    .append('g')
    .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);

    
    svg.selectAll('.canvas_before')
        .data([data['painting']])
        .enter()
            .append('image')
            .attr('transform', function(d) { return 'translate(' + x(canvas_w_shift) + ',' + x(canvas_h_shift) + ')'; })
            .attr('id', 'canvas_init')
            // .attr('x', function(){ return x(5)})
            // .attr('y', x(5))
            .attr('width', x(canvas_width))
            .attr('height', x(canvas_height))
            .classed("canvas_before", true)
            .attr("xlink:href", function(d){
                // console.log(d)
                return array2img(d[current_step])
            })

    index = 0
    svg.selectAll('.strokes_before')
        .data(data['strokes_before'][current_step].slice(0, 4))
        .enter()
        .append('image')
        .attr('transform', function(d, index) { 
            // console.log(index)
            if (index == 0) { 
                return 'translate(' + x(canvas_width + canvas_w_shift + strokes_w_shift) + ',' + x(canvas_h_shift) + ')'; }

            if (index == 1) { 
                return 'translate(' + x(canvas_width + canvas_w_shift + strokes_w_shift + strokes_width + w_space) + ',' + x(canvas_h_shift) + ')'; }

            if (index == 2) { 
                return 'translate(' + x(canvas_width + canvas_w_shift + strokes_w_shift) + ',' + x(canvas_h_shift + strokes_width + w_space) + ')'; }

            if (index == 3) { 
                return 'translate(' + x(canvas_width + canvas_w_shift + strokes_w_shift + strokes_width + w_space) + ',' + x(canvas_h_shift + strokes_width + w_space) + ')'; }
            })
        // .attr('x', function(){ return x(5)})
        // .attr('y', x(5))
        .attr('width', x(strokes_width))
        .attr('height', x(strokes_width))
        .classed("strokes_before", true)
        .attr("xlink:href", function(d){
            // console.log(d)
            index += 1
            return array2img(d)
        })


    var svg_net = svg
        .append("svg")
            .attr("height", x(network_height))
            .attr("width", x(canvas_width + canvas_w_shift + strokes_width * 2 + strokes_w_shift))
            .classed("svg", true)
            .attr('transform', function(d) { return 'translate(' + x(canvas_w_shift) + ',' + x(canvas_height + canvas_h_shift + h_space) + ')'; })


    svg.selectAll('.canvas_after')
        .data([data['painting']])
        .enter()
            .append('image')
            .attr('transform', function(d) { return 'translate(' + x(canvas_w_shift) + ',' + x(canvas_height + canvas_h_shift + network_height + 2 * h_space) + ')'; })
            .attr('id', 'canvas_final')
            // .attr('x', function(){ return x(5)})
            // .attr('y', x(5))
            .attr('width', x(canvas_width))
            .attr('height', x(canvas_height))
            .classed("canvas_after", true)
            .attr("xlink:href", function(d){
                // console.log(d)
                return array2img(d[current_step + 1])
            })

        index = 0
        svg.selectAll('.strokes_after')
            .data(data['strokes_before'][current_step + 1].slice(0, 4))
            .enter()
            .append('image')
            .attr('transform', function(d, index) { 
                if (index == 0) { 
                    return 'translate(' + x(canvas_width + canvas_w_shift + strokes_w_shift) + ',' + x(canvas_height + canvas_h_shift + network_height + 2 * h_space) + ')'; }

                if (index == 1) { 
                    return 'translate(' + x(canvas_width + canvas_w_shift + strokes_w_shift + strokes_width + w_space) + ',' + x(canvas_height + canvas_h_shift + network_height + 2 * h_space) + ')'; }

                if (index == 2) { 
                    return 'translate(' + x(canvas_width + canvas_w_shift + strokes_w_shift) + ',' + x(canvas_height + canvas_h_shift + network_height + strokes_width + h_space + 2 * h_space) + ')'; }

                if (index == 3) { 
                    return 'translate(' + x(canvas_width + canvas_w_shift + strokes_w_shift + strokes_width + w_space) + ',' + x(canvas_height + canvas_h_shift + network_height + strokes_width + h_space + 2 * h_space) + ')'; }
                })
            // .attr('x', function(){ return x(5)})
            // .attr('y', x(5))
            .attr('width', x(strokes_width))
            .attr('height', x(strokes_width))
            .classed("strokes_after", true)
            .attr("xlink:href", function(d){
                // console.log(d)
                index += 1
                return array2img(d)
            })

    var rects = d3.selectAll('rect')

    // d3.select('#mySlider')
    //     .attr('max', data['painting'].length - 2)
    // d3.select('#mySlider').on('slide', function(d){
    //     value = this.value;
    //     console.log(value)
    // })

}

function update(data, value){
    d3.selectAll('.strokes_before')
        .data(data['strokes_before'][Number(value)].slice(0, 4))
        .attr("xlink:href", function(d){
            // console.log(d)
            index += 1
            return array2img(d)
        })

    d3.selectAll('.strokes_after')
        .data(data['strokes_before'][Number(value) + 1].slice(0, 4))
        .attr("xlink:href", function(d){
            // console.log(d)
            index += 1
            return array2img(d)
        })

    d3.selectAll('.canvas_after')
            .data([data['painting']])
            .attr("xlink:href", function(d){
                // console.log(d)
                return array2img(d[Number(value) + 1])
            })

    d3.selectAll('.canvas_before')
        .data([data['painting']])
        .attr("xlink:href", function(d){
            // console.log(d)
            return array2img(d[Number(value)])
        })
}

temp_response = { 
    step: [{'text': 'text', 'value': null}], 
    grid: [{'text': 'text', 'value': null}], 
    stroke_number: [{'text': 'text', 'value': null}], 
    painting: [{'text': 'text', 'value': null}], 
    strokes_before: [{'text': 'text', 'value': null}], 
    strokes_after: [{'text': 'text', 'value': null}], 
    states: [{'text': 'text', 'value': null}], 
    shape_before: [{'text': 'text', 'value': null}], 
    color_before: [{'text': 'text', 'value': null}], 
    alpha_before: [{'text': 'text', 'value': null}] 
}

