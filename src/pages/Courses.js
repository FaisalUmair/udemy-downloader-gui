import React, { useEffect } from 'react';

import { Row, Input, Result } from 'antd';

import Course from '../components/Course';

import Pagination from '../components/Pagination'

import { useDispatch, useSelector } from 'react-redux';

import { loadCourses, searchCourses } from '../ducks/courses';



function Courses(props) {

    const courses = useSelector(state => state.courses.data);

    const totalCourses = useSelector(state => state.courses.total);

    const pageNumber = useSelector(state => state.courses.pageNumber);

    const search = useSelector(state => state.courses.search);

    const downloads = useSelector(state => state.downloads);

    const dispatch = useDispatch();


    useEffect(() => {
        if (!courses.length) {
            dispatch(loadCourses());
        }
    }, [])


    const Paginate = (props) => {
        return totalCourses > props.pageSize
            ?
            <Pagination pageSize={props.pageSize} totalCourses={totalCourses} pageNumber={pageNumber} onChange={(pageNumber) => dispatch(search ? searchCourses(search, pageNumber) : loadCourses(pageNumber))} />
            :
            null
    }


    return (
        <>
            <Row className="p-3">
                <Input.Search placeholder="Search Courses" size="large" allowClear={true} defaultValue={search} onSearch={value => dispatch(searchCourses(value))} />
            </Row>

            {
                courses.length ? (

                    <>
                        <Paginate pageSize={20} />


                        {courses.map((course) => <Course downloadInfo={downloads[course.id]} key={course.id} id={course.id} image={course.image_125_H} title={course.title} />)}


                        <Paginate pageSize={20} />
                    </>

                ) :
                    !props.isLoading ? <Row justify="center" className="p-3">
                        <Result
                            status="404"
                            title="No Courses Found"
                            subTitle="We could not find any courses in your account"
                        />
                    </Row> : null

            }


        </>
    )
}


export default Courses;