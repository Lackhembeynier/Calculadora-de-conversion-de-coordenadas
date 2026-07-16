let cacheDatos = null;

function cambiarModoGrafica() {
    if (cacheDatos) {
        dibujarPuntoPro(cacheDatos.res, cacheDatos.d);
    }
}

function dibujarPuntoPro(res, d) {
    cacheDatos = { res, d };
    const vista = document.getElementById("tipoVista").value;
    const g2d = document.getElementById("grafica-2d");
    const g3d = document.getElementById("grafica-3d");

    if (vista === "2d") {
        g2d.style.display = "block";
        g3d.style.display = "none";
        render2D(res.rect.x, res.rect.y);
    } else {
        g2d.style.display = "none";
        g3d.style.display = "block";
        render3D(res.rect.x, res.rect.y, res.rect.z, d.tipo);
    }
}

function render2D(x, y) {
    const tracePunto = {
        x: [x], y: [y],
        mode: 'markers+text',
        text: ['Punto P'], textposition: 'top right',
        marker: { size: 12, color: 'black' },
        name: 'Coordenada'
    };

    const traceVector = {
        x: [0, x], y: [0, y],
        mode: 'lines',
        line: { color: 'orange', width: 3 },
        name: 'Radio Vector'
    };

    const layout = {
        title: 'Plano Cartesiano / Polar (XY)',
        xaxis: { title: 'Eje X', range: [-20, 20], zeroline: true, zerolinecolor: 'red', zerolinewidth: 3, gridcolor: '#ddd' },
        yaxis: { title: 'Eje Y', range: [-20, 20], zeroline: true, zerolinecolor: 'green', zerolinewidth: 3, gridcolor: '#ddd' },
        showlegend: true
    };

    Plotly.newPlot('grafica-2d', [tracePunto, traceVector], layout);
}

function render3D(x, y, z, tipo) {
    const limite = 20;
    let data = [];

    // 1. Ejes Estilo GeoGebra (X Rojo, Y Verde, Z Azul)
    data.push({ type: 'scatter3d', mode: 'lines', x: [-limite, limite], y: [0, 0], z: [0, 0], line: { color: '#FF4136', width: 6 }, name: 'Eje X' });
    data.push({ type: 'scatter3d', mode: 'lines', x: [0, 0], y: [-limite, limite], z: [0, 0], line: { color: '#2ECC40', width: 6 }, name: 'Eje Y' });
    data.push({ type: 'scatter3d', mode: 'lines', x: [0, 0], y: [0, 0], z: [-limite, limite], line: { color: '#0074D9', width: 6 }, name: 'Eje Z' });

    // 2. Punto P
    data.push({
        type: 'scatter3d', mode: 'markers',
        x: [x], y: [y], z: [z],
        marker: { size: 8, color: 'black' },
        name: 'Punto P'
    });

    // 3. Proyección guiada (Trayectoria corregida)
    data.push({
        type: 'scatter3d', mode: 'lines',
        x: [0, x, x, x], 
        y: [0, 0, y, y], 
        z: [0, 0, 0, z],
        line: { color: 'orange', width: 4, dash: 'dash' },
        name: 'Trayectoria'
    });

    // 4. REPRESENTACIÓN CILÍNDRICA (Solo si seleccionan cilíndricas)
    if (tipo === "cilindricas") {
        let r = Math.sqrt(x*x + y*y);
        let angulos = [];
        for (let i = 0; i <= 40; i++) angulos.push((i / 40) * 2 * Math.PI);

        let xCil = [], yCil = [], zCil = [];
        let alturas = (z === 0) ? [0, 0.1] : [0, z]; 

        for (let h of alturas) {
            let filaX = [], filaY = [], filaZ = [];
            for (let th of angulos) {
                filaX.push(r * Math.cos(th));
                filaY.push(r * Math.sin(th));
                filaZ.push(h);
            }
            xCil.push(filaX); yCil.push(filaY); zCil.push(filaZ);
        }

        data.push({
            type: 'surface',
            x: xCil, y: yCil, z: zCil,
            opacity: 0.2, 
            colorscale: [[0, 'cyan'], [1, 'cyan']], 
            showscale: false,
            name: 'Superficie Cilíndrica',
            hoverinfo: 'skip' 
        });
    }

    // 5. REPRESENTACIÓN ESFÉRICA (Solo si seleccionan esféricas)
    if (tipo === "esfericas") {
        let rho = Math.sqrt(x*x + y*y + z*z);
        let theta = []; // de 0 a 2PI
        for(let i=0; i<=40; i++) theta.push((i/40)*2*Math.PI);
        let phi = [];   // de 0 a PI
        for(let i=0; i<=20; i++) phi.push((i/20)*Math.PI);

        let xEsf=[], yEsf=[], zEsf=[];
        for(let p of phi) {
            let filaX=[], filaY=[], filaZ=[];
            for(let t of theta) {
                filaX.push(rho * Math.sin(p) * Math.cos(t));
                filaY.push(rho * Math.sin(p) * Math.sin(t));
                filaZ.push(rho * Math.cos(p));
            }
            xEsf.push(filaX); yEsf.push(filaY); zEsf.push(filaZ);
        }

        data.push({
            type: 'surface',
            x: xEsf, y: yEsf, z: zEsf,
            opacity: 0.2,
            colorscale: [[0, 'magenta'], [1, 'magenta']], 
            showscale: false,
            name: 'Superficie Esférica',
            hoverinfo: 'skip'
        });
    }

    // Configuración visual
    const layout = {
        title: `Espacio 3D: ${tipo.toUpperCase()}`,
        scene: {
            xaxis: { title: 'X', range: [-limite, limite], showbackground: false, showline: false, zeroline: false, showticklabels: true },
            yaxis: { title: 'Y', range: [-limite, limite], showbackground: false, showline: false, zeroline: false, showticklabels: true },
            zaxis: { title: 'Z', range: [-limite, limite], showbackground: false, showline: false, zeroline: false, showticklabels: true },
            aspectmode: 'cube'
        },
        margin: { l: 0, r: 0, b: 0, t: 40 },
        showlegend: true
    };

    Plotly.newPlot('grafica-3d', data, layout);
}