// Define a custom element
window.customElements.define('mul-js', class extends HTMLElement {
  // Update function to set text/word based on the selected language
  update() {
    MultilingualismJs.log(2, 0, `Update element with reg-id${this['reg-id']}`);
    var foundLanguage = false,
        attributeNames = this.getAttributeNames();
    for(var i=0; i<attributeNames.length; i++) {
      if(attributeNames[i] == 'reg-id') {
        continue;
      }
      if(MultilingualismJs.language == attributeNames[i]) {
        this.innerHTML = this.getAttribute(attributeNames[i]);
        foundLanguage = true;
        break;
      }
    }
    // Use default text/word if no translation founded
    if(!foundLanguage) {
      this.innerHTML = this.hasAttribute('mul-js-default') ? this.getAttribute('mul-js-default') : '???';
    }
  }
});

// Object to handle the logic
var MultilingualismJs = {
  version: 'v0.2.0-alpha',  // Version of this library
  debug: 0,                 // Debug level (for log)
  lockScan: true,           // Lock scan until setup comleted
  blockEvents: true,        // Block DOM watch event if working on the DOM (not used on this version)
  language: '',             // Holds current language
  registred: {},            // Map with registred translations
  // Function to log based on message type and level
  log: (level, messageType, message) => {
    if(MultilingualismJs.debug >= level) {
        if(messageType == 0) {
            console.log(`MulJS => [INFO] ${message}`);
        } else if(messageType == 1) {
          console.warn(`MulJS => [WARN] ${message}`);
        } else if(messageType == 2) {
          console.error(`MulJS => [ERRO] ${message}`);
        }
    }
  },
  // Configure this library and enable scan
  setup: () =>{
    MultilingualismJs.log(1, 0, 'Setup MultilingualismJS library');
    MultilingualismJs.log(1, 0, `Version: ${MultilingualismJs.version}`);
    MultilingualismJs.log(2, 0, 'Register library definitions');
    var browserLanguage = (navigator.language || navigator.userLanguage).toLowerCase();
    MultilingualismJs.register('MUL_JS_BROWSER_LANGUAGE', {'mul-js-default' : browserLanguage}, true);
    if(MultilingualismJs.language.length == 0) {
      MultilingualismJs.language = browserLanguage;
      MultilingualismJs.register('MUL_JS_ACTIVE', {'mul-js-default' : browserLanguage}, true);
    }
    // This needs to be changed otherwise we have a recursive loop
    // var event = () => {
    //   if(MultilingualismJs.blockEvents) {
    //     return;
    //   }
    //   MultilingualismJs.log(1, 0, 'Register DOM-Change on "window.onDomChange"');
    //   MultilingualismJs.scan(false);
    // };
    // if(window.onDomChange) {
    //   window.onDomChange = event;
    // } else if(MutationObserver) {
    //   MultilingualismJs.log(1, 0, 'Register DOM-Change on "MutationObserver"');
    //   new MutationObserver(event).observe(document.documentElement, {
    //     attributes: true,
    //     characterData: true,
    //     childList: true,
    //     subtree: true,
    //     attributeOldValue: true,
    //     characterDataOldValue: true
    //   });
    // }
    MultilingualismJs.lockScan = false;
    MultilingualismJs.blockEvents = false;
    MultilingualismJs.scan();
  },
  // Function to change the language
  setLanguage: (language) => {
    language = language.toLowerCase();
    MultilingualismJs.log(1, 0, `Switch language to ${language}`);
    MultilingualismJs.language = language;
    MultilingualismJs.register('MUL_JS_ACTIVE', {'mul-js-default' : language}, true);
    MultilingualismJs.scan();
  },
  // Function to scan for all elements, inject translation and update them
  scan: (updateLanguagePack=true) => {
    if(MultilingualismJs.lockScan) {
      return;
    }
    MultilingualismJs.blockEvents = true;
    MultilingualismJs.log(1, 0, 'Scan DOM');
    var elements = document.getElementsByTagName("mul-js");
    if(elements.length == 0) {
      MultilingualismJs.log(0, 1, 'No elements founded to update');
    }
    for(var i=0; i<elements.length; i++) {
      var regId = elements[i].getAttribute('reg-id');
      MultilingualismJs.log(2, 0, `Inject to reg-id=${regId}`); 
      if(updateLanguagePack && MultilingualismJs.registred.hasOwnProperty(regId)) {
        for (const [language, text] of Object.entries(MultilingualismJs.registred[regId])) {
          MultilingualismJs.log(2, 0, `Set ${text} for language ${language}`);
          elements[i].setAttribute(language, text);
        }
      }
      elements[i].update();
    }
    MultilingualismJs.blockEvents = false;
    MultilingualismJs.log(2, 0, `Scan DOM completed, updated ${elements.length} elements`);
  },
  // Function to register a translation for a specific reg-id
  register: (regId=undefined, languagePack=undefined, force=false) => {
    if(regId == undefined || regId == null || regId.length == 0) {
      MultilingualismJs.log(0, 2, '"reg-id" is not defined'); 
      return;
    } else if(!force && MultilingualismJs.registred.hasOwnProperty(regId)) {
      MultilingualismJs.log(0, 2, `"reg-id=${regId}" already used`);
      return;
    }
    if(Object.keys(languagePack).length === 0) {
      MultilingualismJs.log(0, 2, `Provided language pack can not be empty`);
      return;
    }
    MultilingualismJs.log(1, 0, `Registration of ${regId} successful`);
    MultilingualismJs.registred[regId] = languagePack;
    MultilingualismJs.scan();
  }
};

// Trigger setup on page loaded
if(window.onload) {
  window.onload = () => {
    MultilingualismJs.setup();
  };
} else {
  document.addEventListener("DOMContentLoaded", () => {
    MultilingualismJs.setup();
  });
}


