import React, { useEffect, useState } from 'react'

const Panel = ({ lb }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-loadbalancer"></i>{t('RESOURCES_LOAD_BALANCER')}</h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{lb.used}</span> / {lb.used + lb.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{lb.used}</div>
                            <p className="status used"><span>Used</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{lb.unused}</div>
                            <p className="status unused"><span>Unused</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel