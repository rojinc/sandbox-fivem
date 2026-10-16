/**
 * Visibility, the screen Lua asked for, and the full-screen wait.
 *
 *   APP_SHOW / APP_HIDE / APP_RESET          (no payload)
 *   SET_STATE { state: 'STATE_CHARACTERS' | 'STATE_SPAWN' }
 *   LOADING_SHOW { message } / LOADING_HIDE
 *
 * STATE_SPLASH is the UI's own default; Lua never sends it.
 */
export const STATE_SPLASH = 'STATE_SPLASH';
export const STATE_CHARACTERS = 'STATE_CHARACTERS';
export const STATE_SPAWN = 'STATE_SPAWN';

const initial = () => ({
    hidden: true,
    state: STATE_SPLASH,
    loading: false,
    loadingMessage: null,
});

export const app = $state(initial());

export function showLoading(message) {
    app.loading = true;
    app.loadingMessage = typeof message === 'string' && message.trim() ? message : null;
}

export function hideLoading() {
    app.loading = false;
    app.loadingMessage = null;
}

/** APP_RESET: back to the splash, visible, nothing loading. */
export function resetApp() {
    Object.assign(app, initial(), { hidden: false });
}
