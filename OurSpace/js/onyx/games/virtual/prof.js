/* Canonical Virtual game Professor Onyx. This is the only full-body Professor sprite instance; the module uses the separate chest-up renderer. */
(()=>{'use strict';
const factory=window.OnyxBipedalPaperDollFactory;
if(!factory||typeof factory.createProfessorActor!=='function')throw new Error('Onyx bipedal paper-doll factory unavailable for Virtual Professor');
const professor=factory.createProfessorActor();
professor.validateIntegration?.();
window.OnyxVirtualProfessorBody=factory.registerIntegratedActor(professor);
window.OnyxVirtualProfessorOnly=true;
})();
