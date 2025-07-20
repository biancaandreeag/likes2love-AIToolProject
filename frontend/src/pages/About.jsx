"use client"

import { useState, useEffect } from "react"
import { useForm, ValidationError } from "@formspree/react"
import "../styles/About.css"
import Navbar from "../components/Navbar"

function About() {
  const [state, handleSubmit] = useForm("xyzjzapv")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    setTimeout(() => {
      const elements = document.querySelectorAll(".animate-element")
      elements.forEach((el) => {
        el.classList.add("visible")
      })
    }, 100)
  }, [])

  useEffect(() => {
    if (state.succeeded) {
      setFormData({ name: "", email: "", subject: "", message: "" })
    }
  }, [state.succeeded])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="about-container">
      <Navbar isFlipped={false} />

      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay"></div>
      </div>

      <div className="about-content">
        <div className="about-header animate-element">
          <h1>About Our AI Models</h1>
          <p className="subtitle">Understanding the technology behind cyberbullying detection</p>
        </div>

        <div className="about-section animate-element">
          <h2>Our Approach</h2>
          <p>
            At likes2love, we leverage state-of-the-art natural language processing models to analyze
            user comments across various social media platforms.Our goal is to detect and prevent cyberbullying
            by capturing the subtle context and tone of online conversations.
          </p>
        </div>

        <div className="models-section animate-element">
          <h2>Dashboard Walkthrough</h2>

          <div className="model-card">
            <div className="model-header">
              <h3>Comments Distribution</h3>
              <div className="model-tag">Primary Sentiment Model</div>
            </div>
            <p>
              For sentiment classification, we utilize the&nbsp;
              <a
                href="https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest"
                target="_blank"
                rel="noopener noreferrer"
                className="model-link"
              >
                <strong>twitter-roberta-base-sentiment-latest </strong>
              </a>
               model developed by Cardiff NLP and hosted on Hugging Face. This is a pretrained RoBERTa-based transformer model fine-tuned specifically for sentiment analysis on Twitter data.
              Each user comment is processed through this model to determine its most probable sentiment label: <em>positive</em>, <em>neutral</em>, or <em>negative</em>. The sentiment with the highest confidence score is assigned to the comment, and we aggregate this data to visualize overall
              sentiment distribution across the platform.
            </p>

            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">Pretrained</span> on millions of real-world tweets
              </div>
              <div className="feature">
                <span className="feature-highlight">Designed</span> to understand real user emotions in social posts
              </div>
              <div className="feature">
                <span className="feature-highlight">Three-label</span> classification
              </div>
            </div>
          </div>

          <div className="model-card">
            <div className="model-header">
              <h3>Sentiment Strength</h3>
              <div className="model-tag">Supporting Model</div>
            </div>
            <p>
              We utilize the same pretrained architecture&nbsp;
              <a
                href="https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest"
                target="_blank"
                rel="noopener noreferrer"
                className="model-link"
              >
                <strong>twitter-roberta-base-sentiment-latest  </strong>
              </a>
              in a complementary capacity to derive a more nuanced sentiment profile
              for each comment. Instead of selecting the label with the highest confidence, we compute the average distribution of
              sentiment probabilities across all inputs. This probabilistic approach provides a more
              granular understanding of emotional tone and mixed sentiments within user-generated content.

            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">Probability-based</span> sentiment scoring for multi-label insight
              </div>
            </div>
          </div>

          <div className="model-card">
              <div className="model-header">
                <h3>General Hate Analyzer</h3>
                <div className="model-tag">Content Moderation</div>
              </div>
              <p>
                Our General Hate Analyzer is an AI-powered tool designed to detect offensive and harmful language online.
                It goes beyond surface-level keywords by analyzing both direct offensiveness and subtle cues like irony,
                offering a more accurate understanding of user intent. This dual-layer approach helps flag toxic content
                that might otherwise be missed, contributing to safer and more respectful digital spaces.
              </p>
              <div className="model-features">
                <div className="feature">
                  <span className="feature-highlight">Dual-layered</span> analysis (offensiveness + irony)
                </div>
                <div className="feature">
                  <span className="feature-highlight">Improved</span> detection of subtle harmful content
                </div>
                <div className="feature">
                  <span className="feature-highlight">Supports</span> safer online environments
                </div>
              </div>
            </div>

            <div className="model-card">
              <div className="model-header">
                <h3>Cyberbullying Classifier</h3>
                <div className="model-tag">Offensive Content Classification</div>
              </div>
              <p>
                This model is a fine-tuned RoBERTa-based neural network designed to classify offensive comments into specific categories: gender, religion, cyberbullying, age, and ethnicity-related offenses.
                It takes comments flagged as offensive and provides detailed labeling to help understand the nature of the harmful content for more precise moderation.
              </p>
              <div className="model-features">
                <div className="feature">
                  <span className="feature-highlight">Fine-tuned</span> on offensive comment categorization
                </div>
                <div className="feature">
                  <span className="feature-highlight">Multi-class</span> classification into five categories
                </div>
                <div className="feature">
                  <span className="feature-highlight">High accuracy</span> of 97% on test data
                </div>
              </div>
            </div>
        </div>
        <div>
          <div className="classification-types">
            <h3>Types of Harmful Content We Detect</h3>
            <div className="types-grid">
              <div className="type-item">
                <div className="type-icon">👥</div>
                <div className="type-name">Discrimination based on gender identity</div>
              </div>
              <div className="type-item">
                <div className="type-icon">⛪️</div>
                <div className="type-name">Attacks targeting religion or beliefs</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🌐</div>
                <div className="type-name">Various other forms of cyberbullying and online abuse</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🎂</div>
                <div className="type-name">Age-related insults or discriminatory remarks</div>
              </div>
              <div className="type-item">
                <div className="type-icon">‍🌍‍</div>
                <div className="type-name">Discrimination based on ethnicity or racial background</div>
              </div>
            </div>
          </div>
        </div>




        {/* CONTACT SECTION - FORMSPREE INTEGRATION */}
        <div className="contact-section animate-element">
          <h2>Get In Touch</h2>
          <p>
            Have questions about our AI models or want to collaborate? We'd love to hear from you. Reach out to our team
            and we'll get back to you as soon as possible.
          </p>

          <div className="contact-container">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Email Us</h4>
                  <p>contact@likes2love.com</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Response Time</h4>
                  <p>Within 24 hours</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Location</h4>
                  <p>Bucharest, Romania</p>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} method="POST">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                  <ValidationError prefix="Name" field="name" errors={state.errors} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required>
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="collaboration">Research Collaboration</option>
                  <option value="technical">Technical Support</option>
                </select>
                <ValidationError prefix="Subject" field="subject" errors={state.errors} />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Tell us about your inquiry, project, or how we can help you..."
                ></textarea>
                <ValidationError prefix="Message" field="message" errors={state.errors} />
              </div>

              <button
                type="submit"
                className={`submit-button ${state.submitting ? "submitting" : ""}`}
                disabled={state.submitting}
              >
                {state.submitting ? (
                  <>
                    <div className="spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9"></polygon>
                    </svg>
                    Send Message
                  </>
                )}
              </button>

              {state.succeeded && (
                <div className="status-message success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              {state.errors && state.errors.length > 0 && (
                <div className="status-message error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  Sorry, there was an error sending your message. Please try again or contact us directly.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
