import React, { useState, useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import {setAppointment} from '../redux/features/appointmentSlice'
import { toast } from "react-toastify";


const minTime = moment('08:00:00', 'HH:mm');
const maxTime = moment('18:00:00', 'HH:mm');

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
 
  const params = useParams();
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isAvailable, setIsAvailable] = useState(false)
  const dispatch = useDispatch();
  const navigate=useNavigate();



  
function disabledMinutes(h) {
  if (h === minTime.hour()) {
    return [...Array(minTime.minute()).keys()];
  } else if (h === maxTime.hour()) {
    return [...Array(60 - maxTime.minute()).keys()].map(i => i + maxTime.minute());
  }
  return [];
}

function disabledHours() {
  return [...Array(24).keys()].filter(h => h < minTime.hour() || h > maxTime.hour());
}

  // login user data

 
  const getUserData = async () => {
    try {
      
      const res = await fetch('/api/v1/doctor/getDoctorById', {
        method: 'POST',
        headers: {
          "Content-type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify
          ({
            doctorId: params.doctorId
          })
      })
      const data = await res.json();
      if (data.success) {
        setDoctors(data.data);

      }
    } catch (error) {
      console.log(error);
    }

  };
  
  // ============ handle availiblity
  const handleAvailability = async () => {
    try {
  //    dispatch(showLoading());
      if(date === "" || time === "")
      {
        toast.success("Please Select data or time");
        return;
      }  

      const res = await axios.post(
        "/api/v1/user/booking-availbility",
        { doctorId: params.doctorId, date, time },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
    //  dispatch(hideLoading());
      if (res.data.success) {
           console.log(res.status);
           if(res.status === 200)
           {
            setIsAvailable(true);
           }
           else
           {
            setIsAvailable(false)
           }
        
          toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      //dispatch(hideLoading());
      console.log(error);
    }
  };
  
  
  // =============== booking func
  const handleBooking = async () => {
    try {
      setIsAvailable(true);
      if (!date && !time) {
        return   toast.error("Date & Time Required");
      }
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctors,
          firstName:doctors.firstName,
          phone:doctors.phone,
          fees:doctors.feesPerCunsaltation,
          userInfo: user,
          userName:user.name,
          userEmail:user.email,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        console.log("in appoint manoage ")
        console.log(res.data);
        dispatch(setAppointment(res.data.data))

          toast.success(res.data.message);
        navigate(`/conform/${params.doctorId}`)
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData();
    //eslint-disable-next-line
  }, []);


  return (
    <div className="container home-wrapper-2 px-4 py-5 align-items-center">
      <h3 className="text-center">Booking Page</h3>
    
      <div className="py-5 m-auto mx-5 m-2">
        {doctors && (
          <div>
            <h4>
              Dr.{doctors.firstName} {doctors.lastName}
            </h4>
            <h4>Fees : {doctors.feesPerCunsaltation}</h4>
            <h4>
              Timings : {doctors.stiming} {"AM"}-{" "}
              {doctors.etiming}{"PM"}
            </h4>
            <div className="d-flex flex-column w-50">
              
              <DatePicker
                aria-required={"true"}
                className="m-2"
                format="DD-MM-YYYY"
                 
                disabledDate={(current) => {
                  let customDate = moment().format("DD-MM-YYYY");
                  return current && current < moment(customDate, "DD-MM-YYYY");
                }} 
                onChange={(value) => {
                  setDate(moment(value).format("DD-MM-YYYY"));
                }}
              />

              <TimePicker
                aria-required={"true"}
                format="HH:mm"
                className="mt-3"
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
                
                onChange={(value) => { 
                  setTime(moment(value).format("HH:mm"));
                }}
              />

              <button
                className="btn btn-primary mt-2"
                onClick={handleAvailability}
              >
                Check Availability
              </button>
              {/* <button className="btn btn-dark mt-2" onClick={handleBooking}>
                Book Now
              </button> */}

              {isAvailable &&(
                    <button className="btn btn-dark mt-2" onClick={handleBooking}>
                    Book Now
                  </button>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
