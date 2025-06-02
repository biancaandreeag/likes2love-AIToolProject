import { useEffect } from "react"
import "../styles/About.css"
import Navbar from "../components/Navbar"

function About() {
  useEffect(() => {
    setTimeout(() => {
      const elements = document.querySelectorAll(".animate-element")
      elements.forEach((el) => {
        el.classList.add("visible")
      })
    }, 100)
  }, [])

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
            At likes2love, we use advanced natural language processing and machine learning techniques to identify and
            prevent cyberbullying in real-time. Our multi-model approach allows us to analyze content across different
            platforms with high accuracy and contextual understanding.
          </p>
        </div>

        <div className="models-section animate-element">
          <h2>AI Models We Use</h2>

          <div className="model-card">
            <div className="model-header">
              <h3>RoBERTa</h3>
              <div className="model-tag">Primary Model</div>
            </div>
            <p>
              RoBERTa (Robustly Optimized BERT Pretraining Approach) is our primary model for content analysis.
              It's a transformer-based model that builds on BERT's architecture with modified key hyperparameters and
              training methodology. RoBERTa excels at understanding context and nuance in language, making it
              particularly effective at detecting subtle forms of cyberbullying.
            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">90%+</span> accuracy in detecting harmful content
              </div>
              <div className="feature">
                <span className="feature-highlight">Contextual</span> understanding of language
              </div>
              <div className="feature">
                <span className="feature-highlight">Multi-lingual</span> support
              </div>
            </div>
          </div>

          <div className="model-card">
            <div className="model-header">
              <h3>BERT</h3>
              <div className="model-tag">Supporting Model</div>
            </div>
            <p>
              BERT (Bidirectional Encoder Representations from Transformers) provides deep bidirectional representations
              from unlabeled text. We use BERT as a supporting model to enhance our understanding of context and
              relationships between words in analyzed content. BERT's pre-training on a large corpus of text helps
              it understand language patterns that may indicate bullying behavior.
            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">Bidirectional</span> context analysis
              </div>
              <div className="feature">
                <span className="feature-highlight">110M+</span> parameters for deep learning
              </div>
              <div className="feature">
                <span className="feature-highlight">Efficient</span> processing of short texts
              </div>
            </div>
          </div>

          <div className="model-card">
            <div className="model-header">
              <h3>GPT</h3>
              <div className="model-tag">Content Analysis</div>
            </div>
            <p>
              We leverage GPT (Generative Pre-trained Transformer) models for deeper content analysis and understanding
              of complex linguistic patterns. GPT's strength in generating human-like text helps us understand context
              and intent behind messages, allowing for more nuanced detection of cyberbullying that might evade
              simpler pattern-matching approaches.
            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">Advanced</span> context comprehension
              </div>
              <div className="feature">
                <span className="feature-highlight">Nuanced</span> intent detection
              </div>
              <div className="feature">
                <span className="feature-highlight">Adaptive</span> to evolving language patterns
              </div>
            </div>
          </div>

          <div className="model-card">
            <div className="model-header">
              <h3>RandomForest</h3>
              <div className="model-tag">Classification</div>
            </div>
            <p>
              RandomForest is an ensemble learning method that operates by constructing multiple decision trees.
              We use RandomForest for its robustness in classification tasks, particularly for categorizing different
              types of harmful content. Its ability to handle large feature sets and resistance to overfitting makes
              it valuable for reliable content classification.
            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">Ensemble</span> learning approach
              </div>
              <div className="feature">
                <span className="feature-highlight">Robust</span> against overfitting
              </div>
              <div className="feature">
                <span className="feature-highlight">Effective</span> with high-dimensional data
              </div>
            </div>
          </div>
        </div>

        <div className="classification-section animate-element">
          <h2>Multi-Label Classification</h2>
          <p>
            Our platform employs multi-label classification techniques to identify multiple types of harmful content
            simultaneously. Unlike traditional binary classification that simply identifies content as "harmful" or "safe,"
            our approach can detect and categorize multiple forms of cyberbullying in a single piece of content.
          </p>

          <div className="classification-diagram">
            <div className="diagram-header">
              <div className="diagram-title">Multi-Label Classification Process</div>
            </div>
            <div className="diagram-content">
              <div className="diagram-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Text Preprocessing</h4>
                  <p>Content is cleaned, tokenized, and prepared for analysis</p>
                </div>
              </div>
              <div className="diagram-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Feature Extraction</h4>
                  <p>Key linguistic features are identified and extracted</p>
                </div>
              </div>
              <div className="diagram-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Multi-Model Analysis</h4>
                  <p>Content is analyzed by multiple AI models in parallel</p>
                </div>
              </div>
              <div className="diagram-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Label Assignment</h4>
                  <p>Multiple relevant labels are assigned to the content</p>
                </div>
              </div>
              <div className="diagram-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Confidence Scoring</h4>
                  <p>Each label receives a confidence score for transparency</p>
                </div>
              </div>
            </div>
          </div>

          <div className="classification-types">
            <h3>Types of Harmful Content We Detect</h3>
            <div className="types-grid">
              <div className="type-item">
                <div className="type-icon">🔤</div>
                <div className="type-name">Verbal Abuse</div>
              </div>
              <div className="type-item">
                <div className="type-icon">👤</div>
                <div className="type-name">Identity-Based Harassment</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🔄</div>
                <div className="type-name">Repeated Targeting</div>
              </div>
              <div className="type-item">
                <div className="type-icon">⚠️</div>
                <div className="type-name">Threats</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🔍</div>
                <div className="type-name">Doxxing</div>
              </div>
              <div className="type-item">
                <div className="type-icon">📢</div>
                <div className="type-name">Public Shaming</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🎭</div>
                <div className="type-name">Impersonation</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🔗</div>
                <div className="type-name">Unwanted Sexual Content</div>
              </div>
            </div>
          </div>
        </div>

        <div className="technology-section animate-element">
          <h2>Our Technology Stack</h2>
          <p>
            Our platform combines cutting-edge AI technologies with robust web development frameworks to deliver
            a seamless, responsive experience for users while providing powerful cyberbullying detection capabilities.
          </p>

          <div className="tech-stack">
            <div className="tech-category">
              <h3>AI & Machine Learning</h3>
              <div className="tech-items">
                <div className="tech-item">PyTorch</div>
                <div className="tech-item">TensorFlow</div>
                <div className="tech-item">Hugging Face Transformers</div>
                <div className="tech-item">scikit-learn</div>
              </div>
            </div>

            <div className="tech-category">
              <h3>Frontend</h3>
              <div className="tech-items">
                <div className="tech-item">React</div>
                <div className="tech-item">CSS3</div>
                <div className="tech-item">JavaScript</div>
              </div>
            </div>

            <div className="tech-category">
              <h3>Backend</h3>
              <div className="tech-items">
                <div className="tech-item">Node.js</div>
                <div className="tech-item">Express</div>
                <div className="tech-item">MongoDB</div>
              </div>
            </div>
          </div>
        </div>

        <div className="team-section animate-element">
          <h2>Our Research Team</h2>
          <p>
            Our platform is developed by a multidisciplinary team of AI researchers, data scientists, and
            cyberbullying prevention experts committed to creating safer online spaces.
          </p>

          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">AI</div>
              <div className="member-info">
                <h4>Dr. Alexandra Ionescu</h4>
                <p>Lead AI Researcher</p>
              </div>
            </div>
            <div className="team-member">
              <div className="member-avatar">ML</div>
              <div className="member-info">
                <h4>Dr. Mihai Lungu</h4>
                <p>Machine Learning Specialist</p>
              </div>
            </div>
            <div className="team-member">
              <div className="member-avatar">NLP</div>
              <div className="member-info">
                <h4>Dr. Cristina Popescu</h4>
                <p>NLP Expert</p>
              </div>
            </div>
            <div className="team-member">
              <div className="member-avatar">CB</div>
              <div className="member-info">
                <h4>Dr. Andrei Dumitrescu</h4>
                <p>Cyberbullying Prevention Specialist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
