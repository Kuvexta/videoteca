const fs = require('node:fs');
const source = fs.readFileSync('Codigo_18_Supervision.gs', 'utf8');
const helper = `/** Impide escribir datos personales en una carpeta compartida. No cambia permisos existentes. */
function exigirDestinoCertificadosPrivado_(carpeta) {
  exigirOrigenInterno("exigirDestinoCertificadosPrivado_");
  const propietario = carpeta.getOwner();
  const ejecutor = (Session.getEffectiveUser().getEmail() || "").toLowerCase();
  if (!propietario || !ejecutor || propietario.getEmail().toLowerCase() !== ejecutor ||
      carpeta.getSharingAccess() !== DriveApp.Access.PRIVATE ||
      carpeta.getEditors().length || carpeta.getViewers().length) {
    throw new Error("Certificados: se requiere una carpeta privada del propietario, sin colaboradores. No se emitió el certificado.");
  }
}

`;
let out = source.replace('SUPERVISION-R1";', 'SUPERVISION-R2";');
out = out.replace('function generarCertificadoAprobado(datos) {', helper + 'function generarCertificadoAprobado(datos) {');
out = out.replace('    const carpetaCerts = obtenerSubcarpeta("Certificados");', '    // Comprobar la raíz antes de crear la subcarpeta y antes de copiar datos personales.\n    exigirDestinoCertificadosPrivado_(obtenerCarpetaRaiz());\n    const carpetaCerts = obtenerSubcarpeta("Certificados");\n    exigirDestinoCertificadosPrivado_(carpetaCerts);');
const old = '    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);';
if (!out.includes(old)) throw Error('No se encontró la publicación que se debe corregir');
out = out.replace(old, '    // El PDF conserva el acceso privado de la carpeta. El alumno recibe el adjunto\n    // por el canal existente; no se publica el nombre ni la nota mediante un enlace.');
fs.writeFileSync('Codigo_19_Certificados_Privados.gs', out);
