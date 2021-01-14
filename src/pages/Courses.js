import React, { useEffect, useState } from "react"

import {
  Row,
  Input,
  Alert,
  Result,
  Modal,
  Button,
  Form,
  Radio,
  Select,
  Tree,
} from "antd"

import Course from "../components/Course"

import Pagination from "../components/Pagination"

import { useDispatch, useSelector } from "react-redux"

import { loadCourses, searchCourses } from "../ducks/courses"

import fs from "fs"
import { remote } from "electron"

import DownloadSettings from "../components/Settings"
import { downloadCourse } from "../ducks/downloads"
const { dialog } = remote

function Courses(props) {
  const courses = useSelector((state) => state.courses.data)

  const totalCourses = useSelector((state) => state.courses.total)

  const pageNumber = useSelector((state) => state.courses.pageNumber)

  const search = useSelector((state) => state.courses.search)

  const downloads = useSelector((state) => state.downloads)

  const settings = useSelector((state) => state.settings)

  const [courseStateData, setCourseStateData] = useState({})

  const [modal, setModal] = useState(false)
  const [curriculumModal, setCurriculumModal] = useState(false)
  const [curriculum, setCurriculum] = useState([])
  const [treeData, setTreeData] = useState([])

  const [checkedKeys, setCheckedKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])

  const [form] = Form.useForm()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!courses.length) {
      dispatch(loadCourses())
    }
  }, [])

  const Paginate = (props) => {
    return totalCourses > props.pageSize ? (
      <Pagination
        pageSize={props.pageSize}
        totalCourses={totalCourses}
        pageNumber={pageNumber}
        onChange={(pageNumber) =>
          dispatch(
            search ? searchCourses(search, pageNumber) : loadCourses(pageNumber)
          )
        }
      />
    ) : null
  }

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

  const { enabledSettings, lectureOption: downloadPreference } = settings
  const allSettings = ["download", "lecture", "attachment", "subtitle"]

  const handleDownload = (course, setLoading) => {
    if (settings.enabledSettings.length < allSettings.length) {
      setCourseStateData({
        course: { ...course },
        setLoading: setLoading,
      })
      setModal(true)
    } else {
      dispatch(downloadCourse(course, setLoading, settings))
    }
  }

  const handleSubmit = (values) => {
    setModal(false)
    dispatch(
      downloadCourse(courseStateData.course, courseStateData.setLoading, {
        ...settings,
        ...values,
      })
    )

    form.resetFields()
  }

  useEffect(() => {
    if (
      Object.keys(courseStateData).length &&
      downloads[courseStateData.course.id]
    ) {
      setCurriculum(downloads[courseStateData.course.id].curriculum)
    } else {
      setCurriculum([])
    }
  }, [Object.keys(downloads).length])

  useEffect(() => {
    if (!curriculum.length) return
    let arr = []
    let obj = {}
    let key = -1
    console.log(curriculum)

    curriculum.forEach((c) => {
      if (c._class == "chapter") {
        key++
        obj = {
          title: c.title,
          key: c.id,
          children: [],
        }
        arr[key] = { ...obj }
      } else {
        obj = { title: c.title, key: c.asset.id }
        arr[key].children.push(obj)
      }
    })
    console.log(arr)
    setTreeData(arr)
    setCurriculumModal(true)
  }, [curriculum])

  const missing = allSettings.filter((s) => {
    return !enabledSettings.includes(s)
  })

  const onCheck = (checkedKeys) => {
    console.log("onCheck", checkedKeys)
    setCheckedKeys(checkedKeys)
  }

  const onSelect = (selectedKeys, info) => {
    console.log("onSelect", info)
    setSelectedKeys(selectedKeys)
  }
  return (
    <>
      <Row className="p-3">
        <Input.Search
          placeholder="Search Courses"
          size="large"
          allowClear={true}
          defaultValue={search}
          onSearch={(value) => dispatch(searchCourses(value))}
        />
      </Row>
      {modal && (
        <Modal
          title="Update Settings"
          visible={true}
          onCancel={() => setModal(false)}
          footer={[]}
          destroyOnClose={true}
        >
          <DownloadSettings
            initialValues={{ ...settings, enabledSettings: [...missing] }}
            onSelectDownloadPath={selectDownloadPath}
            onUpdateCheckedFields={updateCheckedFields}
            form={form}
            onSubmit={handleSubmit}
          />
        </Modal>
      )}

      {curriculumModal && (
        <Modal
          title="Download Specific"
          visible={true}
          onCancel={() => setCurriculumModal(false)}
          footer={[]}
          destroyOnClose={true}
        >
          <Tree
            checkable
            onCheck={onCheck}
            checkedKeys={checkedKeys}
            onSelect={onSelect}
            selectedKeys={selectedKeys}
            treeData={treeData}
          />
        </Modal>
      )}
      {courses.length ? (
        <>
          <Paginate pageSize={20} />

          {courses.map((course) => (
            <Course
              downloadInfo={downloads[course.id]}
              key={course.id}
              onDownload={handleDownload}
              id={course.id}
              image={course.image_125_H}
              title={course.title}
            />
          ))}

          <Paginate pageSize={20} />
        </>
      ) : !props.isLoading ? (
        <Row justify="center" className="p-3">
          <Result
            status="404"
            title="No Courses Found"
            subTitle="We could not find any courses in your account"
          />
        </Row>
      ) : null}
    </>
  )
}

export default Courses
