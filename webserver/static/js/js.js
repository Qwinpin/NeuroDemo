async function upload_image() {
    let rand_id = Math.floor(Math.random() * Math.floor(100000));
    localStorage.setItem('id', rand_id)

    const e = document.getElementById('image').files[0];

    var x = document.getElementById('origin_image')
    x.setAttribute('src', URL.createObjectURL(e))

    let data = new FormData()
    data.append('image', e)

    await fetch('http://localhost:9000/file=' + rand_id, {
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