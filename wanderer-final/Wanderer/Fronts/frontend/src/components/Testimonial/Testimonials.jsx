import React from 'react';
import ava01 from '../../assets/images/ava-1.jpg';
import ava02 from '../../assets/images/ava-2.jpg';
import ava03 from '../../assets/images/ava-3.jpg';
import './testimonials.css'; // Import custom CSS for animation

const Testimonials = () => {
   return (
      <div className="testimonials-wrapper">
         <div className="testimonials-grid">
            {/* First set of testimonials */}
            <div className="testimonial-item">
               <p>
                  Constantly chasing the high of creating a new 
                  @zapier integration in other areas of my life.
               </p>
               <div className="user-info">
                  <img src={ava01} className="avatar" alt="Kelsey Jones" />
                  <div>
                     <h6>Kelsey Jones (She/Her)</h6>
                     <p>@wonderwall7</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  Few things make me feel more powerful than setting up 
                  automations in @zapier to make my life easier and more efficient.
               </p>
               <div className="user-info">
                  <img src={ava02} className="avatar" alt="Ashley Warren" />
                  <div>
                     <h6>Ashley Warren</h6>
                     <p>@ashleynhwarren</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  @zapier consistently makes me feel like a powerful digital wizard. ⚡️
               </p>
               <div className="user-info">
                  <img src={ava03} className="avatar" alt="TJ Sondermann" />
                  <div>
                     <h6>TJ Sondermann</h6>
                     <p>@tsondermann</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  When you make a complex @zapier work and you feel like an absolute boss.
               </p>
               <div className="user-info">
                  <img src={ava01} className="avatar" alt="Advocitude" />
                  <div>
                     <h6>Advocitude</h6>
                     <p>@Advocitude</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  Seems like nothing is impossible with Zaps ⚡️😍
               </p>
               <div className="user-info">
                  <img src={ava02} className="avatar" alt="Abdullah Al-Sweed" />
                  <div>
                     <h6>Abdullah Al-Sweed</h6>
                     <p>@Abdul_alsweed</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  Your small business heart loves a well-placed integration that makes your day.
               </p>
               <div className="user-info">
                  <img src={ava03} className="avatar" alt="Jessica Morrison" />
                  <div>
                     <h6>Jessica Morrison</h6>
                     <p>@jessicacasner</p>
                  </div>
               </div>
            </div>

            {/* Duplicate the set for infinite scroll */}
            <div className="testimonial-item">
               <p>
                  Constantly chasing the high of creating a new 
                  @zapier integration in other areas of my life.
               </p>
               <div className="user-info">
                  <img src={ava01} className="avatar" alt="Kelsey Jones" />
                  <div>
                     <h6>Kelsey Jones (She/Her)</h6>
                     <p>@wonderwall7</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  Few things make me feel more powerful than setting up 
                  automations in @zapier to make my life easier and more efficient.
               </p>
               <div className="user-info">
                  <img src={ava02} className="avatar" alt="Ashley Warren" />
                  <div>
                     <h6>Ashley Warren</h6>
                     <p>@ashleynhwarren</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  @zapier consistently makes me feel like a powerful digital wizard. ⚡️
               </p>
               <div className="user-info">
                  <img src={ava03} className="avatar" alt="TJ Sondermann" />
                  <div>
                     <h6>TJ Sondermann</h6>
                     <p>@tsondermann</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  When you make a complex @zapier work and you feel like an absolute boss.
               </p>
               <div className="user-info">
                  <img src={ava01} className="avatar" alt="Advocitude" />
                  <div>
                     <h6>Advocitude</h6>
                     <p>@Advocitude</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  Seems like nothing is impossible with Zaps ⚡️😍
               </p>
               <div className="user-info">
                  <img src={ava02} className="avatar" alt="Abdullah Al-Sweed" />
                  <div>
                     <h6>Abdullah Al-Sweed</h6>
                     <p>@Abdul_alsweed</p>
                  </div>
               </div>
            </div>

            <div className="testimonial-item">
               <p>
                  Your small business heart loves a well-placed integration that makes your day.
               </p>
               <div className="user-info">
                  <img src={ava03} className="avatar" alt="Jessica Morrison" />
                  <div>
                     <h6>Jessica Morrison</h6>
                     <p>@jessicacasner</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default Testimonials;
