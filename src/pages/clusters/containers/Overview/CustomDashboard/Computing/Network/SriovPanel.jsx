import React, { useEffect, useState } from 'react'

const Panel = ({ sriov }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-soriv"></i>{t('RESOURCES_SR_IOV_NETWORK')}</h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{sriov.internal}</span></p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{sriov.internal}</div>
                            <p className="status internal"><span>{t('RESOURCES_INTERNAL')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{sriov.external}</div>
                            <p className="status external"><span>{t('RESOURCES_EXTERNAL')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel