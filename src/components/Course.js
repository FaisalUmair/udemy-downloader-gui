import React, { useState } from "react"

import {
  downloadCourse,
  pauseDownload,
  resumeDownload,
  deleteDownload,
} from "../ducks/downloads"

import { useDispatch } from "react-redux"

import classNames from "classnames"

import { Card, Row, Col, Button, Progress } from "antd"

import {
  CloudDownloadOutlined,
  PauseOutlined,
  CaretRightOutlined,
} from "@ant-design/icons"

function Course(props) {
  const [isLoading, setLoading] = useState(false)
  const dispatch = useDispatch()


  const isPauseDisabled = () => {


    if (props.downloadInfo) {

      if(props.downloadInfo.status === "waiting"){
        return true;
      }
  

      if (props.downloadInfo.downloadInstance) {
        if (
          props.downloadInfo.status === "waiting" ||
          props.downloadInfo.status === "paused"
        ) {
          return true
        }
      } else {
        return true
      }
    } else {
      return true
    }
  }

  const isResumeDisabled = () => {

    if (props.downloadInfo) {

      if(props.downloadInfo.status === "waiting"){
        return true;
      }


      if (props.downloadInfo.downloadInstance) {
        if (
          props.downloadInfo.status === "waiting" ||
          props.downloadInfo.status === "downloading"
        ) {
          return true
        }
        if (props.downloadInfo.status === "paused") {
          return false
        }
      } else {
        return props.downloadInfo.status === "waiting" ? true : false
      }
    } else {
      return true
    }
  }

  return (
    <Card size="small" loading={isLoading}>
      <Row>
        <Col span={9}>
          <img src={props.image} alt={props.title} />
        </Col>
        <Col span={15} style={{ position: "relative" }}>
          <Row className="mb-3">{props.title}</Row>
          {props.downloadInfo ? (
            <span
              style={{
                display: "inline-block",
                fontSize: "17px",
                position: "absolute",
                top: "-7px",
                right: "0px",
                cursor: "pointer",
              }}
              onClick={() => dispatch(deleteDownload(props.id))}
            >
              &times;
            </span>
          ) : null}
          <Row gutter={8} align="middle" className="mb-2">
            <Col>
              <Button
                onClick={() => props.onDownload(props, setLoading)}
                shape="circle"
                className={classNames("flex justify-center border-2", {
                  "opacity-50": props.downloadInfo,
                })}
                icon={
                  <CloudDownloadOutlined className="bg-indigo-500 text-white rounded-full leading-zero p-1" />
                }
                disabled={props.downloadInfo}
              />
            </Col>
            <Col>
              <Button
                onClick={() => dispatch(pauseDownload(props.id))}
                shape="circle"
                className={classNames("flex justify-center border-2", {
                  "opacity-50": isPauseDisabled(),
                })}
                icon={
                  <PauseOutlined className=" bg-orange-500 text-white rounded-full leading-zero p-1" />
                }
                disabled={isPauseDisabled()}
              />
            </Col>
            <Col>
              <Button
                onClick={() => dispatch(resumeDownload(props.id))}
                shape="circle"
                className={classNames("flex justify-center border-2", {
                  "opacity-50": isResumeDisabled(),
                })}
                icon={
                  <CaretRightOutlined className=" bg-green-500 text-white rounded-full leading-zero p-1" />
                }
                disabled={isResumeDisabled()}
              />
            </Col>

            {props.downloadInfo ? (
              <Col offset={8}>
                <Progress
                  type="circle"
                  percent={20}
                  width={35}
                  showInfo={false}
                  strokeWidth={15}
                />
              </Col>
            ) : null}
          </Row>

          {props.downloadInfo ? (
            <Row className="mt-5">
              <Progress
                percent={props.downloadInfo.currentProgress}
                size="small"
                showInfo={false}
              />
            </Row>
          ) : null}
        </Col>
      </Row>
    </Card>
  )
}

export default Course
