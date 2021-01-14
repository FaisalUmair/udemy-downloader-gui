import React, { useState, useEffect } from "react"

import Course from "../components/Course"

import { useSelector } from "react-redux"
import { Pagination, Row, Result, Card } from "antd"

import { CloudDownloadOutlined } from "@ant-design/icons"

function Downloads() {
  const downloads = useSelector((state) => {
    console.log(state)
    return state.downloads
  })
  const [pageData, setPageData] = useState(null)
  const [current, setCurrent] = useState(1)
  const pageSize = 20
  function paginate(pageNumber) {
    setCurrent(pageNumber)
    setPageData(
      Object.values(downloads).slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
      )
    )
  }

  useEffect(() => {
    paginate(current)
  }, [Object.keys(downloads).length])

  useEffect(() => {
    paginate(1)
  }, [])

  const pagination =
    Object.keys(downloads).length > pageSize ? (
      <Pagination
        pageSize={pageSize}
        current={current}
        onChange={(pageNumber) => paginate(pageNumber)}
        total={Object.keys(downloads).length}
        style={{ padding: "1rem", textAlign: "center" }}
      />
    ) : null
  console.log(downloads)
  return (
    <>
      {Object.keys(downloads).length > 0 ? (
        <>
          <Card
            bodyStyle={{ padding: "10px" }}
            title="Downloads"
            extra={<CloudDownloadOutlined />}
          >
            {pagination}
            {pageData &&
              Object.values(pageData).map((course) => (
                <Course
                  downloadInfo={course}
                  key={course.id}
                  id={course.id}
                  image={course.image}
                  title={course.title}
                />
              ))}
            {pagination}
          </Card>
        </>
      ) : (
        <Row justify="center" align="center" className="p-3">
          <Result status="404" title="No Downloads Found" />
        </Row>
      )}
    </>
  )
}

export default Downloads
