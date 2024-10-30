import React, { useEffect, useState } from 'react'

const Panel = ({ sg }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-security"></i>{t('RESOURCES_SECURITY_GROUP')}</h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{sg.used}</span> / {sg.used + sg.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{sg.used}</div>
                            <p className="status used"><span>{t('RESOURCES_USED')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{sg.unused}</div>
                            <p className="status unused"><span>{t('RESOURCES_UNUSED')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel