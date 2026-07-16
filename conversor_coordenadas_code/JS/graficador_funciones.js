// JS/graficador_funciones.js

function cambioVistaFuncion() {
    const modo = document.getElementById('tipoGraficaFuncion').value;
    const labelFun = document.getElementById('labelFuncion');
    const inputFun = document.getElementById('ecuacionInput');

    if (modo === "explicita") {
        labelFun.innerHTML = "<strong>y(x) =</strong>";
        inputFun.placeholder = "Ej: 2 * sin(x)";
    } else if (modo === "polar") {
        labelFun.innerHTML = "<strong>r(th) =</strong>";
        inputFun.placeholder = "Ej: 5 * cos(3 * th)";
    } else if (modo === "superficie3d") {
        labelFun.innerHTML = "<strong>z(x, y) =</strong>";
        inputFun.placeholder = "Ej: sin(x) + cos(y)";
    }
}

function checkNumberVal(valorEvaluado) {
    if (typeof valorEvaluado === 'object' && valorEvaluado !== null && valorEvaluado.isComplex) {
        return isNaN(valorEvaluado.im) ? null : valorEvaluado.re;
    }
    return valorEvaluado;
}

function generarGraficaEcuacion() {
    const cadenaEcuacion = document.getElementById('ecuacionInput').value;
    const tipoGrafica = document.getElementById('tipoGraficaFuncion').value;
    
    const maxVal = parseFloat(document.getElementById('dominioMax').value);
    const minVal = parseFloat(document.getElementById('dominioMin').value);

    if (!cadenaEcuacion) {
        alert("¡Escribe una ecuación primero!");
        return;
    }

    try {
        const arbolAExpresion = math.parse(cadenaEcuacion);
        const logicaCompilada = arbolAExpresion.compile();

        if (tipoGrafica === "explicita") {
            plot2D_Explicita(logicaCompilada, minVal, maxVal);
        } else if (tipoGrafica === "polar") {
            plot2D_Polar(logicaCompilada, minVal, maxVal);
        } else if (tipoGrafica === "superficie3d") {
            plot3D_Superficie(logicaCompilada, minVal, maxVal);
        }
    } catch (err) {
        alert("Error en la fórmula matemática: " + err.message);
    }
}

function plot2D_Explicita(formulaExp, minV, maxV) {
    const arrX = [], arrY = [];
    const intervalo = (maxV - minV) / 300.0;

    for (let currentX = minV; currentX <= maxV; currentX += intervalo) {
        let v_val = checkNumberVal(formulaExp.evaluate({ x: currentX }));
        arrX.push(currentX);
        arrY.push(v_val);
    }

    const trama = { x: arrX, y: arrY, mode: 'lines', type: 'scatter', line: { color: 'royalblue', width: 2 } };

    // --- SOLUCIÓN: FORZAR VISTA 2D ---
    document.getElementById('grafica-2d').style.display = 'block';
    document.getElementById('grafica-3d').style.display = 'none';
    document.getElementById('tipoVista').value = '2d';
    // ------------------------------------

    Plotly.newPlot('grafica-2d', [trama], {
        title: `Gráfico 2D: y = f(x)`,
        xaxis: { title: 'X (x)', zeroline: true },
        yaxis: { title: 'Y (y)', zeroline: true }
    });
}

function plot2D_Polar(formulaExp, minV, maxV) {
    const thetasArray = [], radioArray = [];
    const resolucionAngular = (maxV - minV) / 400.0;
    const paramPlotX = [], paramPlotY = [];

    for (let i = minV; i <= maxV; i += resolucionAngular) {
        let rCalculado = checkNumberVal(formulaExp.evaluate({ th: i, theta: i }));
        paramPlotX.push(rCalculado * Math.cos(i));
        paramPlotY.push(rCalculado * Math.sin(i));
    }

    const plotTrazado = { x: paramPlotX, y: paramPlotY, mode: 'lines', type: 'scatter', line: { color: 'firebrick', width: 2 } };

    // --- SOLUCIÓN: FORZAR VISTA 2D ---
    document.getElementById('grafica-2d').style.display = 'block';
    document.getElementById('grafica-3d').style.display = 'none';
    document.getElementById('tipoVista').value = '2d';
    // ------------------------------------

    Plotly.newPlot('grafica-2d', [plotTrazado], {
        title: 'Gráfico Curva Polar',
        xaxis: { title: 'X', scaleanchor: "y", scaleratio: 1 },
        yaxis: { title: 'Y' }
    });
}

function plot3D_Superficie(formulaExp, minV, maxV) {
    const arrSteps_x_y = [];
    const densitySteps = (maxV - minV) / 50.0;
    for (let tmp = minV; tmp <= maxV; tmp += densitySteps) arrSteps_x_y.push(tmp);

    let matrizSuperficieZ = [];
    for (let y_val of arrSteps_x_y) {
        let rowTemp = [];
        for (let x_val of arrSteps_x_y) {
            let z_val = checkNumberVal(formulaExp.evaluate({ x: x_val, y: y_val }));
            rowTemp.push(z_val);
        }
        matrizSuperficieZ.push(rowTemp);
    }

    const mapaSuperficie = { z: matrizSuperficieZ, x: arrSteps_x_y, y: arrSteps_x_y, type: 'surface', colorscale: 'Viridis' };

    // --- SOLUCIÓN: FORZAR VISTA 3D ---
    document.getElementById('grafica-3d').style.display = 'block';
    document.getElementById('grafica-2d').style.display = 'none';
    document.getElementById('tipoVista').value = '3d';
    // ------------------------------------
    
    Plotly.newPlot('grafica-3d', [mapaSuperficie], {
        title: 'Superficie Gráfica 3D',
        scene: {
            xaxis: { title: 'Eje X' },
            yaxis: { title: 'Eje Y' },
            zaxis: { title: 'Eje Z' }
        },
        autosize: true
    });
}