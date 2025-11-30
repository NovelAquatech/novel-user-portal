import React, { useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { convertOperator, getAlerts } from '../helper/utils';
import { APP_CONST } from '../helper/application-constant';

export const AlertAdvisories = ({ alerts }) => {
  const responsive = APP_CONST.alert_advisories_responsive_parameter;
  const advisoriesData = getAlerts(alerts) || [];
  const [selectedAlert, setSelectedAlert] = useState(null);

  const updateMsg = (msg) => {
    if (msg.toLowerCase().includes('tvoc'))
      return msg.replace(/tvoc/gi, 'TVOC');
    return msg;
  };

  const processedAlerts = advisoriesData.map((alert) => {
    if (alert.threshold.includes('<b>Combinator:</b>')) {
      const combinator = alert.threshold.match(
        /<b>Combinator:<\/b>\s*(\w+)/
      )[1];
      alert.msg = alert.msg.replace(
        /\band\b|\bor\b/gi,
        combinator.toLowerCase()
      );
    }
    return alert;
  });

  return processedAlerts.length > 0 ? (
    <>
      <Carousel
        className="row"
        responsive={responsive}
        showDots={false}
        infinite={true}
        autoPlay={false}
        autoPlaySpeed={1000}
      >
        {processedAlerts.map((data, i) => (
          <div
            key={i}
            className="col-md-4 col-sm-4 col-xs-12"
            style={{ width: '100%' }}
          >
            <div className="dbb ttlcent">
              <h2 style={{ fontSize: '14px' }}>
                <img src="images/temp.jpg" height={20} alt="icon" />
                {data.name} Alert
              </h2>
              <h3 style={{ fontSize: '10px' }}>{data.devName}</h3>
              <h3 style={{ fontSize: '10px' }}>{data.devEUI}</h3>
              <button
                className="btn btn-link"
                style={{ fontSize: '10px' }}
                onClick={() => setSelectedAlert(data)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </Carousel>

      {selectedAlert && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            background: '#fff',
            padding: '0px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '400px',
          }}
        >
          <div className="dbb ttlcent">
            <h2>
              <img src="images/temp.jpg" alt="icon" className='alert-icons' />
            <span className='alert-name'>{selectedAlert.name} Alert</span>
            </h2>
            <h3 className='alert-infos'>{selectedAlert.devName}</h3>
            <h3 className='alert-infos'>{selectedAlert.devEUI}</h3>
            <h5 className='alert-time'>{selectedAlert.timeDiff}</h5>
            <div
              className={`temp ${
                selectedAlert.customAlert ? 'custom-alert-div alert-value' : 'alert-value'
              }`}
              dangerouslySetInnerHTML={{
                __html: `${
                  typeof selectedAlert.value === 'number'
                    ? Number.isInteger(selectedAlert.value)
                      ? selectedAlert.value
                      : selectedAlert.value.toFixed(2)
                    : selectedAlert.value
                }${
                  selectedAlert.parameter === 'wind_direction'
                    ? '°'
                    : selectedAlert.unit
                }`,
              }}
            />
            <p
              dangerouslySetInnerHTML={{
                __html: convertOperator(updateMsg(selectedAlert.msg)) || '',
              }}
            />
            <p style={{ fontWeight: 'bold' }}>
              {selectedAlert.typeOfBreach === 'minBreach' && (
                <>🔻 Below minimum threshold: {selectedAlert.threshold}</>
              )}
              {selectedAlert.typeOfBreach === 'maxBreach' && (
                <>🔺 Above maximum threshold: {selectedAlert.threshold}</>
              )}
            </p>

            <button
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
              onClick={() => setSelectedAlert(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  ) : (
    <div style={{ textAlign: 'center', height: '100px', paddingTop: '25px' }}>
      <b>No device advisories found.</b>
    </div>
  );
};