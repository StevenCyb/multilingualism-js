window.customElements.define('mul-js', class extends HTMLElement {
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
    if(!foundLanguage) {
      this.innerHTML = this.hasAttribute('mul-js-default') ? this.getAttribute('mul-js-default') : '???';
    }
  }
});

var MultilingualismJs = {
  version: 'v0.2.0-alpha',
  debug: 0,
  lockScan: true,
  blockEvents: true,
  language: '',
  registred: {},
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
  setLanguage: (language) => {
    language = language.toLowerCase();
    MultilingualismJs.log(1, 0, `Switch language to ${language}`);
    MultilingualismJs.language = language;
    MultilingualismJs.register('MUL_JS_ACTIVE', {'mul-js-default' : language}, true);
    MultilingualismJs.scan();
  },
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

if(window.onload) {
  window.onload = () => {
    MultilingualismJs.setup();
  };
} else {
  document.addEventListener("DOMContentLoaded", () => {
    MultilingualismJs.setup();
  });
}


