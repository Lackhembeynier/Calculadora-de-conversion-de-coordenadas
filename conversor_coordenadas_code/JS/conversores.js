// Fórmulas de conversión base
function rectToPolar(x, y) {
    let r = Math.sqrt(x * x + y * y);
    let theta = Math.atan2(y, x); 
    return { r: r, theta: theta };
}

function polarToRect(r, theta) {
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);
    return { x: x, y: y };
}

function gradosARadianes(deg) {
    return deg * (Math.PI / 180);
}

// Fórmulas para Esféricas
function rectToEsferica(x, y, z) {
    let rho = Math.sqrt(x * x + y * y + z * z);
    let theta = Math.atan2(y, x);
    // Si rho es 0, evitamos división por cero en acos
    let phi = (rho === 0) ? 0 : Math.acos(z / rho); 
    return { rho: rho, theta: theta, phi: phi };
}

function esfericaToRect(rho, theta, phi) {
    let x = rho * Math.sin(phi) * Math.cos(theta);
    let y = rho * Math.sin(phi) * Math.sin(theta);
    let z = rho * Math.cos(phi);
    return { x: x, y: y, z: z };
}