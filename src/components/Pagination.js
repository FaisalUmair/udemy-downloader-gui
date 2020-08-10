import React from 'react';

import { Row, Pagination as AntPagination } from 'antd';


function Pagination(props) {
    return (
        <Row justify="center" className="p-3 bg-gray-100">
            <AntPagination
                total={props.totalCourses}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                pageSize={props.pageSize}
                defaultCurrent={1}
                current={props.pageNumber}
                showLessItems={true}
                onChange={props.onChange}
            />
        </Row>
    )
}


export default Pagination;