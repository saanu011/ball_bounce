const express = require('express');

const app = express();
var fs = require('fs');

// get array
app.route('/coordinate')
    .get(get_coordinates);

function get_coordinates(req, res) {
    // console.log(req.query.restitution);
    res.json({"Coordinates array": ball_coordinate(req.query.restitution) });
}

// get past calculations
app.route('/history')
    .get(past_calculations);

function past_calculations() {
    if (fs.existsSync('./ball_history_data.json')) {
        
        fs.readFile('./ball_history_data.json', function (err, data) {
            var json = JSON.parse(data)
            if (req.query.calculation_number) {
                res.json({
                    data: json.array[req.query.calculation_number]
                });
            } else {
                res.json({
                    msg: `Calculation number ${req.query.calculation_number} does not exist.`
                });
            }

        })
    } else {
        res.json({
            msg: "No data on previous calulations"
        });
    }
}

function ball_coordinate(restitution) {
    var restitution = Number(restitution)
    // v = current velocity, t = initial time, dt = time stamp,  
    var h0 = 5, v= 0, g = 9.8, t = 0, dt = 0.01, hmax = h0, h = h0 ,hstop = 0.01, t_last = -(Math.pow((2*h0/g), 0.5)), vmax = Math.pow(2 * hmax * g ,0.5)
    var coordinates_array = [];
    var freefall = true
    var bounces = 0;
    while (hmax > hstop) {
        if(freefall){
            
        hnew = h + v*dt - 0.5*g*dt*dt
        if(hnew < 0) {
            t = t_last + 2*( Math.pow((2*hmax/g), 0.5))
            freefall = false
            t_last = t
            h = 0
        } else {
            t = t + dt
            v = v - g*dt
            h = hnew
        }
    } else {
        bounces += 1;
        t = t 
        vmax = vmax * restitution
        v = vmax
        freefall = true
        h = 0
    }

    hmax = 0.5*vmax*vmax/g;
    coordinates_array.push({x: t, y: h})
    }

    if (fs.existsSync('./ball_history_data.json')) {
        
        fs.readFile('./ball_history_data.json', function (err, data) {
            var json = JSON.parse(data)
            json.array.push(coordinates_array)
        
            fs.writeFile('./ball_history_data.json', JSON.stringify(json), (err) => {
                if (err) {
                    console.log("Error write storing data: "+ err);
                }
            })
        })
    } else {
        fs.writeFile('./ball_history_data.json', JSON.stringify({"array": coordinates_array}), (err) => {
            if (err) {
                console.log("Error write storing data: "+ err);
            }
        });
    }
    
    return coordinates_array
}

module.exports = app;