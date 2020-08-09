import React from 'react';

import Course from '../components/Course';

import { useSelector } from 'react-redux';


function Downloads() {

    const downloads = useSelector(state => state.downloads);

    return (
        Object.values(downloads).slice(0, 20).map((course) => <Course downloadInfo={course} key={course.id} id={course.id} image={course.image} title={course.title} />)
    )

}


export default Downloads;