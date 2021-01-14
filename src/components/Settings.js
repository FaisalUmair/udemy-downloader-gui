import React from "react"
import { Card, Button, Switch, Alert, Form, Radio, Select, Empty } from "antd"
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

const Settings = (props) => {
  const {
    form,
    onSelectDownloadPath: selectDownloadPath,
    onUpdateCheckedFields: updateCheckedFields,
    settingsForm,
  } = props
  return (
    <>
      <Form
        layout="vertical"
        form={props.form}
        name="settings"
        preserve={false}
        initialValues={props.initialValues}
        onFinish={(values) =>
          props.onSubmit({ ...props.initialValues, ...values })
        }
      >
        <Form.Item shouldUpdate>
          {() => {
            const enabledSettings = form.getFieldValue("enabledSettings")
            return (
              <>
                <Form.Item name="enabledSettings" noStyle />

                {settingsForm || enabledSettings.includes("download") ? (
                  <Card
                    className="border-b-0 rounded-none"
                    type="inner"
                    title={
                      <>
                        {settingsForm && (
                          <Switch
                            className="mr-2"
                            size="small"
                            onChange={(checked) =>
                              updateCheckedFields("download", checked)
                            }
                            defaultChecked={enabledSettings.includes(
                              "download"
                            )}
                          />
                        )}
                        Download Path
                      </>
                    }
                    size="small"
                    extra={<FolderOutlined />}
                  >
                    {enabledSettings.includes("download") ? (
                      <>
                        <Button
                          onClick={selectDownloadPath}
                          className="w-full h-10"
                          type="dashed"
                        >
                          <FolderOpenOutlined /> Select Location
                        </Button>

                        <Form.Item name="downloadPath" noStyle>
                          <Alert
                            className="bg-gray-200 bg-opacity-75 mt-3 border-0"
                            message={form.getFieldValue("downloadPath")}
                          />
                        </Form.Item>
                      </>
                    ) : settingsForm ? (
                      <Empty
                        imageStyle={{
                          height: 80,
                        }}
                        description="Select at start of download"
                      />
                    ) : null}
                  </Card>
                ) : null}

                {settingsForm || enabledSettings.includes("lecture") ? (
                  <Card
                    className="border-b-0 rounded-none"
                    type="inner"
                    title={
                      <>
                        {settingsForm && (
                          <Switch
                            className="mr-2"
                            size="small"
                            onChange={(checked) =>
                              updateCheckedFields("lecture", checked)
                            }
                            defaultChecked={enabledSettings.includes("lecture")}
                          />
                        )}
                        Lecture
                      </>
                    }
                    size="small"
                    extra={<PlaySquareOutlined />}
                  >
                    {enabledSettings.includes("lecture") ? (
                      <>
                        <Form.Item className="mb-3" name="lectureOption">
                          <Radio.Group>
                            <Radio value="downloadAll" className="mb-2 block">
                              Download All Lectures
                            </Radio>
                            <Radio value="downloadSpecific">
                              Download Specific Lectures
                            </Radio>
                          </Radio.Group>
                        </Form.Item>

                        <Form.Item noStyle name="lectureQuality">
                          <Select
                            placeholder="Preferred Video Quality"
                            className="w-full"
                          >
                            <Select.Option value="1080">1080p</Select.Option>
                            <Select.Option value="720">720p</Select.Option>
                            <Select.Option value="480">480p</Select.Option>
                            <Select.Option value="360">360p</Select.Option>
                            <Select.Option value="270">270p</Select.Option>
                            <Select.Option value="144">144p</Select.Option>
                          </Select>
                        </Form.Item>
                      </>
                    ) : settingsForm ? (
                      <Empty
                        imageStyle={{
                          height: 80,
                        }}
                        description="Select at start of download"
                      />
                    ) : null}
                  </Card>
                ) : null}
                {settingsForm || enabledSettings.includes("attachment") ? (
                  <Card
                    className="rounded-none"
                    type="inner"
                    title={
                      <>
                        {settingsForm && (
                          <Switch
                            className="mr-2"
                            size="small"
                            onChange={(checked) =>
                              updateCheckedFields("attachment", checked)
                            }
                            defaultChecked={enabledSettings.includes(
                              "attachment"
                            )}
                          />
                        )}
                        Attachments
                      </>
                    }
                    size="small"
                    extra={<FileZipOutlined />}
                  >
                    {enabledSettings.includes("attachment") ? (
                      <>
                        <Form.Item noStyle name="attachmentOption">
                          <Radio.Group>
                            <Radio value="downloadAll" className="mb-2 block">
                              Download All Attachments
                            </Radio>
                            <Radio value="dontDownload" className="mb-2 block">
                              Don't Download Attachments
                            </Radio>
                            <Radio value="downloadSpecific" className="block">
                              Download Specific Attachments
                            </Radio>
                          </Radio.Group>
                        </Form.Item>

                        {form.getFieldValue("attachmentOption") ===
                        "downloadSpecific" ? (
                          <Form.Item
                            className="mt-3 mb-0"
                            name="allowedAttachments"
                          >
                            <Select
                              mode="multiple"
                              placeholder="Select Attachment Types"
                              className="w-full"
                            >
                              <Select.Option value="File">File</Select.Option>
                              <Select.Option value="Article">
                                Article
                              </Select.Option>
                              <Select.Option value="E-Book">
                                E-Book
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        ) : null}
                      </>
                    ) : settingsForm ? (
                      <Empty
                        imageStyle={{
                          height: 80,
                        }}
                        description="Select at start of download"
                      />
                    ) : null}
                  </Card>
                ) : null}
                {settingsForm && enabledSettings.includes("subtitle") ? (
                  <Card
                    className="rounded-none"
                    type="inner"
                    title={
                      <>
                        {settingsForm && (
                          <Switch
                            className="mr-2"
                            size="small"
                            onChange={(checked) =>
                              updateCheckedFields("subtitle", checked)
                            }
                            defaultChecked={enabledSettings.includes(
                              "subtitle"
                            )}
                          />
                        )}
                        Subtitles
                      </>
                    }
                    size="small"
                    extra={<ContainerOutlined />}
                  >
                    {enabledSettings.includes("subtitle") ? (
                      <>
                        <Form.Item noStyle name="subtitleOption">
                          <Radio.Group>
                            <Radio value="dontDownload" className="mb-2 block">
                              Don't Download Subtitles
                            </Radio>
                            <Radio value="download" className="block">
                              Download Subtitles
                            </Radio>
                          </Radio.Group>
                        </Form.Item>

                        {form.getFieldValue("subtitleOption") === "download" ? (
                          <Form.Item
                            className="mt-3 mb-0"
                            name="subtitleLanguage"
                          >
                            <Select
                              showSearch
                              placeholder="Choose Subtitle Language"
                              className="w-full"
                            >
                              <Select.Option value="English">
                                English
                              </Select.Option>
                              <Select.Option value="Norwegian">
                                Norwegian
                              </Select.Option>
                              <Select.Option value="Turkish">
                                Turkish
                              </Select.Option>
                              <Select.Option value="Traditional Chinese">
                                Traditional Chinese
                              </Select.Option>
                              <Select.Option value="Swedish">
                                Swedish
                              </Select.Option>
                              <Select.Option value="Russian">
                                Russian
                              </Select.Option>
                              <Select.Option value="Polish">
                                Polish
                              </Select.Option>
                              <Select.Option value="Persian">
                                Persian
                              </Select.Option>
                              <Select.Option value="Malay">Malay</Select.Option>
                              <Select.Option value="Korean">
                                Korean
                              </Select.Option>
                              <Select.Option value="Japanese">
                                Japanese
                              </Select.Option>
                              <Select.Option value="Italian">
                                Italian
                              </Select.Option>
                              <Select.Option value="Indonesian">
                                Indonesian
                              </Select.Option>
                              <Select.Option value="Hindi">Hindi</Select.Option>
                              <Select.Option value="Hebrew">
                                Hebrew
                              </Select.Option>
                              <Select.Option value="Finnish">
                                Finnish
                              </Select.Option>
                              <Select.Option value="Dutch">Dutch</Select.Option>
                              <Select.Option value="Danish">
                                Danish
                              </Select.Option>
                              <Select.Option value="Czech">Czech</Select.Option>
                              <Select.Option value="Spanish">
                                Spanish
                              </Select.Option>
                              <Select.Option value="Simplified Chinese">
                                Simplified Chinese
                              </Select.Option>
                              <Select.Option value="Portuguese">
                                Portuguese
                              </Select.Option>
                              <Select.Option value="German">
                                German
                              </Select.Option>
                              <Select.Option value="French">
                                French
                              </Select.Option>
                              <Select.Option value="Arabic">
                                Arabic
                              </Select.Option>
                              <Select.Option value="Thai">Thai</Select.Option>
                              <Select.Option value="Romanian">
                                Romanian
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        ) : null}
                      </>
                    ) : settingsForm ? (
                      <Empty
                        imageStyle={{
                          height: 80,
                        }}
                        description="Select at start of download"
                      />
                    ) : null}
                  </Card>
                ) : null}

                <Form.Item noStyle shouldUpdate>
                  <Button
                    type="primary"
                    shape="round"
                    className="h-10 mt-4 tracking-wide"
                    htmlType="submit"
                    block
                  >
                    Save Settings
                  </Button>
                </Form.Item>
              </>
            )
          }}
        </Form.Item>
      </Form>
    </>
  )
}

export default Settings
