import React from 'react'
import '../styles/home.css'
import { Container, Row, Col, CardSubtitle } from 'reactstrap'
import heroImg from '../assets/images/hero-img01.jpg'
import heroImg02 from '../assets/images/hero-img02.jpg'
import heroImg03 from '../assets/images/hero-img03.jpg'
import heroImg04 from '../assets/images/hero-img04.jpg'
// import heroImg01 from '../assets/images/gallery-03.jpg'
// import worldImg from '../assets/images/world.png'
import experienceImg from '../assets/images/experience2.jpg'

import Subtitle from './../shared/subtitle'
import SearchBar from './../shared/SearchBar'
import ServiceList from '../services/ServiceList'
import FeaturedTourList from '../components/Featured-tours/FeaturedTourList'
import MasonryImagesGallery from '../components/Image-gallery/MasonryImagesGallery'
import Testimonials from '../components/Testimonial/Testimonials'
import NewsLetter from '../shared/Newsletter'
import TopDeals from '../components/Popular-destination/TopDeals'
import { NavLink } from 'react-router-dom';
import PackagesList from '../components/Recommendations/Recommendations'


const Home = () => {
   const testdd = localStorage.getItem("access_token");

   return <>
      {/* ========== HERO SECTION ========== */}
      
      <section>
         <Container>
         {/* <h1> {testdd}</h1> */}
            <Row>
               {/* <Col lg='6'>
                  <div className="hero__content">
                     <div className="hero__subtitle d-flex align-items-center">
                        <Subtitle subtitle={"Don't Stop Creating Memories"} />
                        <img src={worldImg} alt="" />
                     </div>
                     <h1>Every journey is a chapter in your <span className='hightlight'> Story</span></h1>
                     <p>
                     At Wanderer, you only find the best. We do the hard work so you don’t have to
                     With quality, you also get lowest prices, last-minute availability and 24x7 support.
                     Offbeat or mainstream, a tour or a show, a game or a museum - we have ‘em all.
                     </p>
                  </div>
               </Col> */}
               {/* < UserDetails /> */}

               <Col lg='3'className="desktop-images">
                  <div className="hero__img-box">
                     <img src={heroImg} alt="" />
                  </div>
               </Col>
               
               <Col lg='3'className="desktop-images">
                  <div className="hero__img-box mt-5">
                     <img src={heroImg02} alt="" />
                  </div>
               </Col>
               <Col lg='3'className="desktop-images">
                  <div className="hero__img-box">
                     <img src={heroImg03} alt="" />
                  </div>
               </Col>
               
               <Col lg='3'className="desktop-images">
                  <div className="hero__img-box mt-5">
                     <img src={heroImg04} alt="" />
                  </div>
               </Col>

               <Col lg='3'className="desktop1-images">
                  <div className="hero__img-box mt-5">
                     <img src={heroImg04} alt="" />
                  </div>
               </Col>

               <SearchBar />
            </Row>
         </Container>
      </section>
      {/* ============================================================== */}

      {/* ==================== HERO SECTION START ====================== */}
      <section>
         <Container>
            <Row>
               {/* <Col lg='3'>
                  <h5 className="services__subtitle">What we serve</h5>
                  <h2 className="services__title">We offer our best services</h2>
               </Col> */}
               <ServiceList />
            </Row>
         </Container>
      </section>
      {/* =========================== Your recommended_packages ========================= */}
      <section className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 py-6">
    <h2 className="text-2xl font-bold mb-4 text-center">
      Popular Recommendations for You
    </h2>
    {/* Package List */}
    <div className="flex flex-wrap justify-center gap-6">
      <PackagesList/>
    </div>
  </div>
    </section>

      {/* ========== FEATURED TOUR SECTION START ========== */}
      <section>
         <Container>
            <Row>
               <Col lg='12' className='mb-5'>
                  <Subtitle subtitle={'Explore'} />
                  <h2 className='featured__tour-title'>Our featured tours</h2>
               </Col>
               <FeaturedTourList />
            </Row>
         </Container>
      </section>
      {/* ========== FEATURED TOUR SECTION END =========== */}

      {/* ========== TOP DEALS SECTION START ========== */}
      <section>
      <Container>
            <Row>
               <Col lg='12' className='mb-5'>
               </Col>
               <TopDeals />
            </Row>
         </Container>
      </section>
      {/* ========== TOP  DEALS SECTION END =========== */}

      {/* ========== EXPERIENCE SECTION START ============ */}
      <section>
         <Container>
            <Row>
               <Col lg='6'>
                  <div className="experience__content">
                     <Subtitle subtitle={'Experience'} />
                     <h2>With our all experience <br /> we will serve you</h2>
                     <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                        <br /> Quas aliquam, hic tempora inventore suscipit unde. </p>
                  </div>

                  <div className="counter__wrapper d-flex align-items-center gap-5">
                     <div className="counter__box">
                        <span>12k+</span>
                        <h6>Successful trip</h6>
                     </div>
                     <div className="counter__box">
                        <span>2k+</span>
                        <h6>Regular clients</h6>
                     </div>
                     <div className="counter__box">
                        <span>15</span>
                        <h6>Year experience</h6>
                     </div>
                  </div>
               </Col>
               <Col lg='6'>
                  <div className="experience__img">
                     <img src={experienceImg} alt=""/>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
      {/* ========== EXPERIENCE SECTION END ============== */}

      {/* ========== GALLERY SECTION START ============== */}
      <section>
         <Container>
            <Row>
               <Col lg='12'>
                  <Subtitle subtitle={'Gallery'} />
                  <h2 className="gallery__title">Visit our customers tour gallery</h2>
               </Col>
               <Col lg='12'>
                  <MasonryImagesGallery />
               </Col>
            </Row>
         </Container>
      </section>
      {/* ========== GALLERY SECTION END ================ */}

      {/* ========== TESTIMONIAL SECTION START ================ */}
      <section>
         <Container>
            <Row>
               <Col lg='12'>
                  <Subtitle subtitle={'Fans Love'} />
                  <h2 className="testimonial__title">What our fans say about us</h2>
               </Col>
               <Col lg='12'>
                  <Testimonials />
               </Col>
            </Row>
         </Container>
      </section>
      {/* ========== TESTIMONIAL SECTION END ================== */}
      <NewsLetter />
   </>
}

export default Home