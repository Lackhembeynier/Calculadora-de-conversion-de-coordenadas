function actualizarEtiquetas()
 {
    const tipo = document.getElementById("tipoCoordenada").value;
    const l1 = document.getElementById("valorx");
    const l2 = document.getElementById("valory");
    const l3 = document.getElementById("valorz");
    const g3 = document.getElementById("grupo-val3");
    const noang= document.getElementById("quitarang");
    

    noang.style.display="block"

    if (tipo === "rectangulares") 
    {
        l1.innerText = "Componente X:";
        l2.innerText = "Componente Y:";
        l3.innerText = "Componente Z:";
        g3.style.display = "block";
        noang.style.display="none";

      
    }

    else if (tipo === "polares")
    {
        l1.innerText = "Radio (r):";
        l2.innerText = "Ángulo (θ):";
        g3.style.display = "none";
    } 

    else if (tipo === "cilindricas") 
    {
        l1.innerText = "Radio (r):";
        l2.innerText = "Ángulo (θ):";
        l3.innerText = "Altura (Z):";
        g3.style.display = "block";

    } 
    
    else if (tipo === "esfericas") 
    {
        l1.innerText = "Radio (ρ):";
        l2.innerText = "Ángulo Azimutal (θ):";
        l3.innerText = "Ángulo Polar (φ):";
        g3.style.display = "block";
    }
}

function iniciarProceso() 
{
    const tipo = document.getElementById("tipoCoordenada").value;
    const v1 = parseFloat(document.getElementById("val1").value);
    const v2 = parseFloat(document.getElementById("val2").value);
    const v3 = parseFloat(document.getElementById("val3").value) || 0;
    const unidad = document.querySelector('input[name="unidad"]:checked').value;

    if (isNaN(v1) || isNaN(v2))
     {
        alert("Por favor, ingresa valores numéricos válidos.");
        return;
    }

    let anguloTheta = v2;
    let anguloPhi = v3; 

    // Convertir a radianes si el usuario seleccionó grados
    if (unidad === "grados") {
        if (tipo !== "rectangulares") anguloTheta = gradosARadianes(v2);
        if (tipo === "esfericas") anguloPhi = gradosARadianes(v3);
    }

    let resultados = calcularTodo(v1, anguloTheta, anguloPhi, v3, tipo);
    mostrarEnPantalla(resultados, {v1, v2, v3, tipo, unidad, anguloTheta, anguloPhi});
}

function calcularTodo(v1, angTheta, angPhi, v3_original, tipo) {
    let res = { rect: {}, pol: {}, cil: {}, esf: {} };

    if (tipo === "rectangulares") {
        res.rect = { x: v1, y: angTheta /* en este caso v2 es la componente Y */, z: v3_original };
        let p = rectToPolar(res.rect.x, res.rect.y);
        res.pol = p;
        res.cil = { r: p.r, theta: p.theta, z: res.rect.z };
        res.esf = rectToEsferica(res.rect.x, res.rect.y, res.rect.z);

    } else if (tipo === "cilindricas" || tipo === "polares") {
        let rct = polarToRect(v1, angTheta);
        let z_val = (tipo === "cilindricas") ? v3_original : 0;
        
        res.rect = { x: rct.x, y: rct.y, z: z_val };
        res.pol = { r: v1, theta: angTheta };
        res.cil = { r: v1, theta: angTheta, z: z_val };
        res.esf = rectToEsferica(res.rect.x, res.rect.y, res.rect.z);

    } else if (tipo === "esfericas") {
        let rct = esfericaToRect(v1, angTheta, angPhi);
        res.rect = rct;
        let p = rectToPolar(rct.x, rct.y);
        res.pol = p;
        res.cil = { r: p.r, theta: p.theta, z: rct.z };
        res.esf = { rho: v1, theta: angTheta, phi: angPhi };
    }
    return res;
}

function mostrarEnPantalla(res, d) {
    document.getElementById("salida-texto").innerHTML = `
        <b>Rectangulares:</b> (x: ${res.rect.x.toFixed(3)}, y: ${res.rect.y.toFixed(3)}, z: ${res.rect.z.toFixed(3)})<br>
        <b>Polares:</b> (r: ${res.pol.r.toFixed(3)}, θ: ${res.pol.theta.toFixed(3)} rad)<br>
        <b>Cilíndricas:</b> (r: ${res.cil.r.toFixed(3)}, θ: ${res.cil.theta.toFixed(3)} rad, z: ${res.cil.z.toFixed(3)})<br>
        <b>Esféricas:</b> (ρ: ${res.esf.rho.toFixed(3)}, θ: ${res.esf.theta.toFixed(3)} rad, φ: ${res.esf.phi.toFixed(3)} rad)
    `;

    const mostrarPasos = document.getElementById("checkPasos").checked;
    const contenedor = document.getElementById("procedimiento-contenedor");
    
    if (mostrarPasos) {
        contenedor.style.display = "block";
        document.getElementById("pasos-texto").innerHTML = generarLogDePasos(res, d);
    } else {
        contenedor.style.display = "none";
    }

    dibujarPuntoPro(res, d);
}

function generarLogDePasos(res, d) {
    let pasos = "";

    if (d.tipo === "rectangulares") {
        pasos += `<strong>1. Convertir a Cilíndricas (r, θ, z):</strong><br>`;
        pasos += `• <b>Radio (r):</b> r = √(x² + y²) = √(${d.v1}² + ${d.v2}²) = ${res.cil.r.toFixed(4)}<br>`;
        pasos += `• <b>Ángulo (θ):</b> θ = arctan(y/x) = arctan(${d.v2}/${d.v1}) = ${res.cil.theta.toFixed(4)} rad<br>`;
        pasos += `• <b>Altura (z):</b> z se mantiene igual = ${d.v3}<br><br>`;

        pasos += `<strong>2. Convertir a Esféricas (ρ, θ, φ):</strong><br>`;
        pasos += `• <b>Radio (ρ):</b> ρ = √(x² + y² + z²) = √(${d.v1}² + ${d.v2}² + ${d.v3}²) = ${res.esf.rho.toFixed(4)}<br>`;
        pasos += `• <b>Ángulo Polar (φ):</b> φ = arccos(z/ρ) = arccos(${d.v3}/${res.esf.rho.toFixed(4)}) = ${res.esf.phi.toFixed(4)} rad<br>`;

    } else if (d.tipo === "cilindricas") {
        pasos += `<strong>1. Convertir a Rectangulares (x, y, z):</strong><br>`;
        pasos += `• <b>X:</b> x = r * cos(θ) = ${d.v1} * cos(${d.anguloTheta.toFixed(4)}) = ${res.rect.x.toFixed(4)}<br>`;
        pasos += `• <b>Y:</b> y = r * sin(θ) = ${d.v1} * sin(${d.anguloTheta.toFixed(4)}) = ${res.rect.y.toFixed(4)}<br>`;
        pasos += `• <b>Z:</b> z se mantiene igual = ${d.v3}<br><br>`;
        
        pasos += `<strong>2. Convertir a Esféricas (ρ, θ, φ):</strong><br>`;
        pasos += `Primero usamos las rectangulares (x,y,z) calculadas para hallar ρ y φ como se explicó antes.<br>`;

    } else if (d.tipo === "esfericas") {
        pasos += `<strong>1. Convertir a Rectangulares (x, y, z):</strong><br>`;
        pasos += `Fórmulas base: x = ρ·sin(φ)·cos(θ) | y = ρ·sin(φ)·sin(θ) | z = ρ·cos(φ)<br>`;
        pasos += `• <b>X:</b> ${d.v1} * sin(${d.anguloPhi.toFixed(4)}) * cos(${d.anguloTheta.toFixed(4)}) = ${res.rect.x.toFixed(4)}<br>`;
        pasos += `• <b>Y:</b> ${d.v1} * sin(${d.anguloPhi.toFixed(4)}) * sin(${d.anguloTheta.toFixed(4)}) = ${res.rect.y.toFixed(4)}<br>`;
        pasos += `• <b>Z:</b> ${d.v1} * cos(${d.anguloPhi.toFixed(4)}) = ${res.rect.z.toFixed(4)}<br>`;
    } else {
        pasos += `Conversión base de Polares a Rectangulares: x = r·cos(θ), y = r·sin(θ).`;
    }

    return pasos;
}