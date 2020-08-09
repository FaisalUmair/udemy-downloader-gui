import React from 'react';

import LoginForm from '../components/LoginForm'

import { login } from '../ducks/user';

import { useSelector, useDispatch } from 'react-redux';

import { Form } from 'antd';

import { Redirect } from 'react-router-dom';

import { remote } from "electron";

import './Login.css';

const { BrowserWindow, getCurrentWindow, session } = remote;

const parent = getCurrentWindow()

const dimensions = parent.getSize();


function LoginPage() {

    const accessToken = useSelector(state => state.user.accessToken);

    const dispatch = useDispatch();

    const [form] = Form.useForm();


    const onSubmit = (values) => {

        const loginWindow = new BrowserWindow({
            width: dimensions[0] - 100,
            height: dimensions[1] - 100,
            modal: true,
            parent
        });

        loginWindow.loadURL(values.isBusiness ? `https://${values.businessName}.udemy.com/join/login-popup` : `https://www.udemy.com/join/login-popup`);


        session.defaultSession.webRequest.onBeforeSendHeaders(
            { urls: ["*://*.udemy.com/*"] },
            (request, callback) => {
                if (request.requestHeaders.Authorization) {
                    loginWindow.destroy();
                    session.defaultSession.clearStorageData();
                    dispatch(login(request.requestHeaders.Authorization.split(" ")[1]))
                }
                callback({ requestHeaders: request.requestHeaders });
            }
        );
    }

    return accessToken ? <Redirect to="/dashboard/courses" /> : <LoginForm form={form} onSubmit={onSubmit} />
}

export default LoginPage;