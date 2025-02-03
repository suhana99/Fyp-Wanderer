import React from 'react'
import ServiceCard from './ServiceCard'
import { Col } from 'reactstrap'
import starImg from '../assets/images/star2.png'
import greedImg from '../assets/images/cash2.png'
import heartImg from '../assets/images/heart2.png'
import coolImg from '../assets/images/cool2.png'

const servicesData = [
   {
      imgUrl: starImg,
      title: `Only the finest`,
      desc: `At Headout, you only find the best. We do the hard work so you don’t have to.`,
   },
   {
      imgUrl: greedImg,
      title: `Greed is good`,
      desc: `With quality, you also get lowest prices, last-minute availability and support`,
   },
   {
      imgUrl: heartImg,
      title: 'Experience every flavour',
      desc: `Offbeat or mainstream, a tour or a show or a museum - we have ‘em all.`,
   },
   {
      imgUrl: coolImg,
      title: 'No pain, only gain',
      desc: `Didn’t love it? We’ll give you your money back. Not cocky, just confident.`,
   },
]

const ServiceList = () => {
   return <>
      {
         servicesData.map((item, index) => (
            <Col lg='3' md='6' sm='12' className='mb-4' key={index}>
               <ServiceCard item={item} />
            </Col>))
      }
   </>

}

export default ServiceList