import os from 'os';

const SAVE_SETTINGS = 'app/settings/SAVE_SETTINGS';

const RESET_SETTINGS = 'app/settings/RESET_SETTINGS'


const initialState = {
    enabledSettings: ['download', 'lecture', 'attachment', 'subtitle'],
    downloadPath: os.homedir() + '/Downloads',
    lectureOption: 'downloadAll',
    lectureQuality: '720',
    attachmentOption: 'downloadAll',
    allowedAttachments: [],
    subtitleOption: 'download',
    subtitleLanguage: 'English'
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case SAVE_SETTINGS:
            return action.settings
        case RESET_SETTINGS:
            return initialState
        default:
            return state;
    }
}

export function saveSettings(settings) {
    return { type: SAVE_SETTINGS, settings };
}

export function resetSettings() {
    return { type: RESET_SETTINGS };
}