const fs = require("fs");
const path = require("path");

exports.loadTemplate = (templateName, replacements) => {
  const filePath = path.join(__dirname, `../HtmlEmailTemplates/${templateName}.html`);
  
  let html = fs.readFileSync(filePath, "utf8");

  Object.keys(replacements).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, replacements[key]);
  });

  return html;
};