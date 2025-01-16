const scriptUrl =
  "https://raw.githubusercontent.com/KevinDana99/te-entrego/master/dist/assets/build.js";
async function loadScript(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const scriptContent = await response.text();
    const scriptElement = document.createElement("script");
    scriptElement.textContent = scriptContent;
    document.body.appendChild(scriptElement);

    console.log("Script cargado y ejecutado correctamente");
  } catch (error) {
    console.error("Error al cargar el script:", error);
  }
}

loadScript(scriptUrl);
