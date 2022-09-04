import { readFile, writeFile } from 'fs';
import { exit } from 'process';
import { question } from 'readline-sync';

function d2h(d) {
    return (d / 256 + 1 / 512).toString(16).substring(2, 4);
}

const toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}

const path = question('MP4 video path: ')

readFile(path, function (err, data) {
if (err) {
    console.error(err);
}
else {
    for (var i = 0; i <= data.length; i++) {
        if(data[i] === 0x6D && data[i + 1] === 0x76 && data[i + 2] === 0x68 && data[i + 3] === 0x64) {
            const _duration = (i + 4) + 4 * 4
            const _timescale = (i + 4) + 4 * 3

            const timescale = parseInt(d2h(data[_timescale]) + d2h(data[_timescale + 1]) + d2h(data[_timescale + 2]) + d2h(data[_timescale + 3]), 16)
            const duration = parseInt(d2h(data[_duration]) + d2h(data[_duration + 1]) + d2h(data[_duration + 2]) + d2h(data[_duration + 3]), 16) / timescale
            console.log('----------------Information----------------')
            console.log('Timescale:', timescale)
            console.log('Duration:', duration, '|', toHHMMSS(duration))
            console.log('-------------------------------------------')
              
            const value = question(`New video duration in seconds (Invalid number or Ctrl + C to exit): `)
            const n = parseInt(value)
            if(isNaN(n)) {
                console.error('Invalid number')
                exit()
            }
            const hex = (n * timescale).toString(16)
            console.log('Hex:', '0x' + hex)
            let arr_index = 3

            for(let i = 0; i < 3; i++) {
                data[_duration + i] = 0
            }

            for (let index = hex.length; index > 0; index -= 2) {
                let element = hex.substring(index - 2, index)
                element = element.length === 1 ? '0' + element : element

                data[_duration + arr_index] = parseInt(element, 16)
                arr_index--
            }


            var buf = Buffer.from(data.buffer);
            writeFile(path, buf, function(err){if(err)throw err;})
            console.log('Wrote to a file')
        }
    }
}
});

