USE 'ninja';

SELECT 
     CONCAT("[",
          GROUP_CONCAT(
               CONCAT("{did:'",did,"'"),
               CONCAT(",device_type:'",device_type,"'"),
               CONCAT(",default_name:'",default_name,"'"),
               CONCAT(",tags:'",tags,"'"),
               CONCAT(",is_sensor:'",is_sensor,"'"),
               CONCAT(",is_actuator:'",is_actuator,"'"),
               CONCAT(",is_silent:'",is_silent,"'"),
               CONCAT(",has_time_series:'",has_time_series,"'"),
               CONCAT(",has_subdevice_count:'",has_subdevice_count,"'}")
          )
     ,"]") AS json FROM vendor_devices LIMIT 1000;