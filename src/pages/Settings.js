import React from "react"
import DownloadSettings from "../components/Settings"

import { useSelector, useDispatch } from "react-redux"

import { Card, Button, Switch, Alert, Form, Radio, Select, Empty } from "antd"

import { resetSettings, saveSettings } from "../ducks/settings"

import fs from "fs"

import { remote } from "electron"

import {
  SettingOutlined,
  FolderOutlined,
  PlaySquareOutlined,
  FileZipOutlined,
  ContainerOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons"

const { dialog } = remote

function Settings() {
  const settings = useSelector((store) => store.settings)

  const [form] = Form.useForm()

  const dispatch = useDispatch()

  const selectDownloadPath = () => {
    const path = dialog.showOpenDialogSync({
      properties: ["openDirectory"],
    })

    if (path && path[0]) {
      fs.access(path[0], fs.R_OK && fs.W_OK, function (err) {
        if (err) {
          console.log(err)
        } else {
          form.setFieldsValue({ downloadPath: path[0] })
        }
      })
    }
  }

  const updateCheckedFields = (field, checked) => {
    const enabledSettings = form.getFieldValue("enabledSettings")
    const index = enabledSettings.indexOf(field)

    if (checked) {
      if (index === -1) enabledSettings.push(field)
    } else {
      if (index !== -1) enabledSettings.splice(index, 1)
    }

    form.setFieldsValue({ enabledSettings })
  }

  const handleSubmit = (settings) => {
    dispatch(saveSettings(settings))
  }

  return (
    <Card
      bodyStyle={{ padding: "10px" }}
      title="Settings"
      extra={<SettingOutlined />}
    >
      <DownloadSettings
        form={form}
        initialValues={settings}
        onSubmit={handleSubmit}
        onSelectDownloadPath={selectDownloadPath}
        onUpdateCheckedFields={updateCheckedFields}
        settingsForm
      />
    </Card>
  )
}

export default Settings
