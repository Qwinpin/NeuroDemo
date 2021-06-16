window.main_plot = null;
window.text_to_process = ''


function init_plot(){
    // console.log(d3.select('#result').style('width').slice(0,-2))
    window.div_width = parseInt(d3.select('#result').style('width').slice(0,-2))
    main_plot = d3.select('#result')
        .append('svg')
        .attr('height', "640px")
        .attr('width', "90%")
        .attr('transform', 'translate(' + (div_width * 0.05) + ',0)')
        .attr('id', 'main_plot')

    window.main_plot_width = parseInt(main_plot.style('width').slice(0,-2))
    window.main_plot_height = parseInt(main_plot.style('height').slice(0,-2))

    window.main_plot_scale_x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, main_plot_width])
    window.main_plot_scale_y = d3.scaleLinear()
        .domain([0, 100])
        .range([0, main_plot_height])
    console.log(main_plot_scale_x(50))

    init_menu();
    plot_text_input();
    plot_tokenization(['In', 'put', 't', 'ext'])
}


function init_menu(){
    window.main_menu_width = main_plot_scale_x(98)
    window.main_menu_height = main_plot_scale_y(10)
    window.main_menu = d3.select('#main_plot')
        .append('g')
        .attr('width', main_menu_width)
        .attr('transform', 'translate(' + main_plot_scale_x(1) + ',0)')
        .attr('height', main_menu_height)


    // console.log(main_menu.style('width'), main_menu_height)
    var menu_scale_x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, main_menu_width])
    var menu_scale_y = d3.scaleLinear()
        .domain([0, 100])
        .range([0, main_menu_height])
    let bandScale = d3.scaleBand()
        .domain(['left_arrow', 'Intro', 'Token', 'Emb1', 'Emb2', 'Emb3', 'Emb4', 'Att1', 'Att2', 'Att3', 'Att4',  'Att5','Fin', 'right_arrow'])
        .range([0, main_menu_width])
    bandScale  
        .paddingInner([0.05])
        .paddingOuter([0.1])
    
    // console.log(menu_scale_x(100))
    var menu_blocks_width = menu_scale_x(5)
    let menu_blocks_meta = [
        {'short_name': 'left_arrow'},
        {'short_name': 'Intro', 'name': 'Intro', 'tips': 'Intro'},
        {'short_name': 'Token', 'name': 'Token', 'tips': 'Tokenization process'},
        {'short_name': 'Emb1', 'name': 'Token embedding', 'tips': 'Embedding of tokens'},
        {'short_name': 'Emb2', 'name': 'Position embedding', 'tips': 'Embedding of tokens positions'},
        {'short_name': 'Emb3', 'name': 'Token type embedding', 'tips': 'Embedding of tokens types'},
        {'short_name': 'Emb4', 'name': 'Resulting embedding', 'tips': 'Summation and normalization of embeddings'},
        {'short_name': 'Att1', 'name': 'Attention: QKV', 'tips': 'Embedding into query, key and value'},
        {'short_name': 'Att2', 'name': 'Attention: weights', 'tips': 'Dot product of Q and K - attention weights'},
        {'short_name': 'Att3', 'name': 'Attention: weighted value', 'tips': 'Multiplication of V and attention weights: weighted representation of tokens'},
        {'short_name': 'Att4', 'name': 'Attention: multiple heads of attention', 'tips': 'Concatenation of multiple head tokens representations'},
        {'short_name': 'Att5', 'name': 'Attention: linear layer', 'tips': 'Additional linear layer plus residual connection'},
        {'short_name': 'Fin', 'name': 'Fin', 'tips': 'Final architecture representation'},
        {'short_name': 'right_arrow'}
    ]
    var menu_blocks = main_menu
        .selectAll('.menu_blocks')
        .data(menu_blocks_meta)
        .enter()
        .append('g')
        .classed('.menu_blocks', true)
        .attr('width', menu_blocks_width)
        .attr('height', menu_blocks_width)
        .attr('id', function(d){
            return d['short_name']
        })
        .attr('transform', function(d){
            return 'translate(' + bandScale(d.short_name) + ', 0)'
        })

    menu_blocks
        .filter(function(d){ 
            return (d.short_name !== 'left_arrow') && (d.short_name !== 'right_arrow')
        })
        .append('rect')
        .attr("rx", 1)
        .attr("ry", 1)
        .attr('width', menu_blocks_width)
        .attr('height', menu_blocks_width)
        .classed("custom-header", true)

    menu_blocks
        .filter(function(d){ 
            return (d.short_name !== 'left_arrow') && (d.short_name !== 'right_arrow')
        })
        .append('text')
        .text(function(d){
            return d.short_name;
        })
        .attr('y', (menu_blocks_width / 2 + 8))
        .attr('x', menu_blocks_width / 2)
        .style("text-anchor", "middle")
        .classed('nn_text', true)
    
    menu_blocks
        .filter(function(d){ 
            return (d.short_name === 'left_arrow') | (d.short_name === 'right_arrow')
        })
        .append('circle')
        .attr("r", menu_blocks_width / 4)
        .attr("cx", menu_blocks_width / 2)
        .attr("cy", menu_blocks_width / 2)
        .classed("custom-header", true)


    var menu_arrows = main_menu
        .append('g')
        .attr('id', 'menu_arrows')

    for (var i=0; i<menu_blocks_meta.length - 1; i++){
        draw_arrow(menu_arrows, 
            [
                {
                    'x': bandScale(menu_blocks_meta[i]['short_name']) + menu_blocks_width + menu_blocks_width * 0.1,
                    'y': menu_blocks_width * 0.5
                },
                {
                    'x': bandScale(menu_blocks_meta[i + 1]['short_name']) - menu_blocks_width * 0.1,
                    'y': menu_blocks_width * 0.5
                }
            ]
        )
    }
    
}


function draw_arrow(svg, data, delay){
    var line = d3.line()
        .curve(d3.curveLinear)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

    var path = svg.append("path")
        .datum(data.reverse())
        .attr("fill", "none")
        .attr("d", line)
        .classed('arrow_line', true)
        .classed('custom-header', true)
    
    function repeat_arrow(){
        var totalLength = path.node().getTotalLength();
        path
            .attr("stroke-dashoffset", 0)
            .transition(d3.easeLinear)
            .delay(1100)
            .duration(1100)
            .attr("stroke-dasharray", totalLength+","+totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition(d3.easeLinear)
            .duration(1100)
            .attr("stroke-dasharray", totalLength+","+0)
            .on('end', repeat_arrow)
    }
    repeat_arrow()
}


function plot_text_input(){
    var text_input_width = (main_plot_scale_x(98))
    var text_input_height = (main_plot_scale_y(8))
    window.text_input = d3.select('#main_plot')
        .append('g')
        .attr('width', text_input_width)
        .attr('transform', 'translate(' + main_plot_scale_x(1) + ',' + main_plot_scale_y(15) + ')')
        .attr('height', text_input_height)


    var text_input_inputs = text_input
        .append('foreignObject')
        .attr('width', text_input_width)
        .attr('height', text_input_height)

    text_input_inputs
        .append('xhtml:span')
        .attr('float', 'left')
        .html('<input type="text" id="text_input" value="Input text" maxlength=96  style="height:' + text_input_height + 'px"/>')
        // .style('height', (text_input_height + 'px'))

    text_input_inputs
        .append('xhtml:span')
        .attr('float', 'left')
        .html('<input type="button" id="button_input" style="height:' + text_input_height + 'px"/>')
        .attr('height', (text_input_height + 'px'))

    d3.select('#button_input')
        .on('click', function(d){
            update_data(d3.select('#text_input')['_groups'][0][0].value)
        })
    d3.select('#text_input')
        .on('keypress', function(event, d){
            if (event.keyCode === 13){
                update_data(d3.select('#text_input')['_groups'][0][0].value)
            }
        })
}


function update_data(text){
    console.log('Oops', text)
}


function plot_tokenization(data){
    var plot_width = main_plot_scale_x(98)
    var plot_height = main_plot_scale_y(70)
    window.plot_tokens = d3.select('#main_plot')
        .append('g')
        .attr('width', plot_width)
        .attr('transform', 'translate(' + main_plot_scale_x(1) + ',' + main_plot_scale_y(25) + ')')
        .attr('height', plot_height)

    var tokens_block = plot_tokens
        .append('g')
        .attr('transform', 'translate(' + 0 + ',' + (plot_height * 0.01) + ')')

    v_shift = 0
    var tokens_height = plot_height * 0.07
    var tokens_width = plot_width * 0.1
    var tokens_margin = plot_width * 0.01

    var tokens = tokens_block
        .selectAll('.tokens')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d){
            let res = 'translate(' + 0 + ',' + (tokens_height + v_shift) + ')'
            v_shift += tokens_height + tokens_margin
            return res
        })
    tokens
        .append('rect')
        .attr('width', tokens_width)
        .attr('height', tokens_height)
        .classed('tokens', true)
        .classed('custom-header', true)

    tokens
        .append('text')
        .text(function(d){
            return d;
        })
        .attr('x', tokens_width / 2)
        .attr('y', (tokens_height / 2 + 8))
        .style("text-anchor", "middle")
        .classed('nn_text', true)
}