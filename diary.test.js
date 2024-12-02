import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, login } from './index.js';
import { updatePassword } from './settings.js';

vi.mock('./common.js', () => ({
    showToast: vi.fn(),
}));

const apiUrl = 'http://localhost:3000';

describe('Sign-up functionality tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        
        // Mock document.getElementById
        global.document = {
            getElementById: vi.fn((id) => {
                const mockElements = {
                    'signup-username': { value: 'testuser' },
                    'signup-password': { value: 'password123' },
                    'signup-result': { innerText: '' },
                    'loading-spinner': { style: { display: '' } },
                };
                return mockElements[id] || null;
            }),
        };

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Sign-up successful.' }),
            })
        );
    });

    it('should call fetch with correct data on successful sign-up', async () => {
        await signUp();

        expect(fetch).toHaveBeenCalledWith(`${apiUrl}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        });
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});

describe('Login functionality tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        // Mock document.getElementById
        global.document = {
            getElementById: vi.fn((id) => {
                const mockElements = {
                    'login-username': { value: 'loginuser' },
                    'login-password': { value: 'loginpass' },
                    'login-result': { innerText: '' },
                    'login-error': { innerText: '' },
                };
                return mockElements[id] || null;
            }),
        };

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Login successful', redirect: '/diary.html' }),
            })
        );
    });

    it('should call fetch with correct data on successful login', async () => {
        await login();

        expect(fetch).toHaveBeenCalledWith(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'loginuser', password: 'loginpass' }),
        });
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});


describe('Update password functionality tests', () => {
    let currentPasswordInput, newPasswordInput, confirmNewPasswordInput;

    beforeEach(() => {
        vi.resetAllMocks();

        // Mock input elements
        currentPasswordInput = { value: 'currentpassword' };
        newPasswordInput = { value: 'newpassword123' };
        confirmNewPasswordInput = { value: 'newpassword123' };

        // Mock localStorage
        global.localStorage = {
            getItem: vi.fn(() => 'mockUsername'),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        };

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Password updated successfully.' }),
            })
        );
    });

    it('should call fetch with correct data on successful password update', async () => {
        await updatePassword(currentPasswordInput, newPasswordInput, confirmNewPasswordInput);

        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'mockUsername',
                currentPassword: 'currentpassword',
                newPassword: 'newpassword123',
                confirmNewPassword: 'newpassword123',
            }),
        });
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});






