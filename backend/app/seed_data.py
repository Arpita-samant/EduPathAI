from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import models, auth
from app.ai_service import get_default_roadmap_milestones

def seed_database(db: Session):
    # Check if already seeded
    existing_demo = db.query(models.User).filter(models.User.email == "demo@edupath.ai").first()
    if existing_demo:
        return

    print("Seeding database with demo student, jobs, and learning resources...")

    # 1. Create Demo User
    demo_user = models.User(
        email="demo@edupath.ai",
        password_hash=auth.get_password_hash("demo1234"),
        full_name="Alex Chen",
        is_demo=True,
        created_at=datetime.utcnow() - timedelta(days=14)
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 2. Create Realistic Student Profile for Demo User
    demo_profile = models.StudentProfile(
        user_id=demo_user.id,
        education_level="Undergraduate (Senior Year)",
        degree="B.Tech in Computer Science & Engineering",
        major="Computer Science",
        graduation_year=2026,
        gpa=3.82,
        technical_skills=[
            {"name": "React", "proficiency": 4, "verified": True, "score": 88},
            {"name": "TypeScript", "proficiency": 4, "verified": True, "score": 84},
            {"name": "JavaScript", "proficiency": 4, "verified": True, "score": 90},
            {"name": "Python", "proficiency": 4, "verified": True, "score": 86},
            {"name": "FastAPI", "proficiency": 3, "verified": True, "score": 80},
            {"name": "SQL & PostgreSQL", "proficiency": 3, "verified": False, "score": 70},
            {"name": "Tailwind CSS", "proficiency": 4, "verified": False, "score": 85},
            {"name": "Git & GitHub", "proficiency": 4, "verified": True, "score": 92},
            {"name": "Docker", "proficiency": 2, "verified": False, "score": 55},
            {"name": "RESTful APIs", "proficiency": 4, "verified": True, "score": 88},
        ],
        soft_skills=[
            "Analytical Problem Solving",
            "Technical Writing & Documentation",
            "Agile Sprint Delivery",
            "Effective Team Communication"
        ],
        certifications=[
            {
                "name": "Meta Front-End Developer Professional Certificate",
                "issuer": "Coursera / Meta",
                "year": 2024,
                "url": "https://coursera.org/verify/meta-frontend"
            },
            {
                "name": "Python for Data Science & AI",
                "issuer": "IBM",
                "year": 2023,
                "url": "https://coursera.org/verify/ibm-python"
            }
        ],
        projects=[
            {
                "title": "Smart Campus Space Reservation Engine",
                "tech_stack": ["React", "FastAPI", "PostgreSQL", "Tailwind CSS"],
                "github_link": "https://github.com/alexchen-dev/campus-reserve",
                "live_link": "https://campus-reserve.vercel.app",
                "description": "Full-stack reservation platform used by 400+ students weekly with automated conflict detection and JWT session authentication."
            },
            {
                "title": "Real-Time Dev Metrics Dashboard",
                "tech_stack": ["TypeScript", "Next.js", "Recharts", "Tailwind CSS"],
                "github_link": "https://github.com/alexchen-dev/dev-metrics",
                "live_link": "https://devmetrics-preview.vercel.app",
                "description": "Interactive telemetry dashboard visualizing GitHub PR velocity and commit health with custom responsive charts."
            }
        ],
        interests=[
            "Full-Stack Web Engineering",
            "Modern Cloud & Serverless Infrastructure",
            "Developer Productivity Tooling",
            "Generative AI Web Integrations"
        ],
        career_goals="Seeking an Associate or Junior Full-Stack Engineer role where I can build scalable, high-impact web products and master cloud-native architectures.",
        raw_resume_text="""ALEX CHEN
San Francisco, CA | alex.chen@edupath.ai | github.com/alexchen-dev | linkedin.com/in/alexchen-dev

EDUCATION
University of California / Computer Science & Engineering
B.S. in Computer Science | Expected May 2026 | GPA: 3.82/4.00
Relevant Coursework: Data Structures & Algorithms, Database Systems, Web Architecture, Distributed Systems, Software Engineering.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript (ES6+), Python, SQL, HTML5/CSS3
Frameworks & Libraries: React 18, Next.js, FastAPI, Node.js, Tailwind CSS, Express
Databases & Tools: PostgreSQL, SQLite, Git, Docker, REST APIs, Postman, Vite, Vercel

PROJECTS
Smart Campus Space Reservation Engine | React, FastAPI, PostgreSQL, Tailwind
- Architected a responsive reservation web application handling 400+ active student sessions with role-based auth.
- Reduced double-booking scheduling conflicts by 95% using transactional PostgreSQL isolation queries.
- Built automated Swagger documentation and deployed CI/CD pipeline via GitHub Actions.

Real-Time Dev Metrics Dashboard | TypeScript, Next.js, Recharts
- Developed high-contrast telemetry dashboard rendering real-time developer productivity charts.
- Optimized client bundle size by 35% through tree-shaking and dynamic import code splitting.

EXPERIENCE & LEADERSHIP
Undergraduate Peer Tutor — Computer Science Dept. (Aug 2024 - Present)
- Conducted weekly office hours assisting 60+ students with algorithm design, debugging, and web programming labs.
""",
        completeness_score=95,
        target_career="Full-Stack Software Engineering"
    )
    db.add(demo_profile)
    db.commit()

    # 3. Create Verified Assessment for Demo User
    demo_assessment = models.Assessment(
        user_id=demo_user.id,
        domain="Full-Stack Software Engineering",
        questions=[],
        answers={"1": 1, "2": 2, "3": 0, "4": 0, "5": 1},
        skill_score=85.0,
        interest_score=94.0,
        suitability_score=88.5,
        ai_explanation={
            "breakdown": {
                "academic_fit": 92,
                "verified_skill_score": 85,
                "interest_alignment": 94,
                "market_demand": 94,
                "overall_match": 89
            },
            "strengths": [
                "Strong conceptual mastery of React lifecycle and asynchronous API handling.",
                "Proven database optimization acumen (indexing and query tuning).",
                "Demonstrated enthusiasm for intuitive product engineering and client delivery."
            ],
            "recommendations": [
                "Level up on Docker containerization and cloud CI/CD workflows.",
                "Explore Redis caching layer patterns to complement relational PostgreSQL skills."
            ]
        }
    )
    db.add(demo_assessment)
    db.commit()

    # 4. Create Active Roadmap for Demo User
    demo_roadmap = models.Roadmap(
        user_id=demo_user.id,
        target_career="Full-Stack Software Engineering",
        estimated_weeks=8,
        is_active=True
    )
    db.add(demo_roadmap)
    db.commit()
    db.refresh(demo_roadmap)

    # Seed 8 Milestones
    milestones_data = get_default_roadmap_milestones("Full-Stack Software Engineering")
    for m in milestones_data:
        milestone = models.RoadmapMilestone(
            roadmap_id=demo_roadmap.id,
            phase=m["phase"],
            week_number=m["week_number"],
            title=m["title"],
            description=m["description"],
            topics=m["topics"],
            project_prompt=m["project_prompt"],
            project_github_url=m.get("project_github_url", ""),
            resource_links=m["resource_links"],
            status=m["status"],
            completed_at=datetime.utcnow() - timedelta(days=7) if m["status"] == "completed" else None
        )
        db.add(milestone)
    db.commit()

    # 5. Create Initial ATS Analysis for Demo User
    demo_ats = models.AtsAnalysis(
        user_id=demo_user.id,
        target_role="Junior Full-Stack Software Engineer",
        job_description="Seeking a Junior Full-Stack Engineer with strong TypeScript, React, and REST API skills. Experience with PostgreSQL, Docker, and CI/CD pipelines is a plus.",
        ats_score=82,
        matched_keywords=["React", "TypeScript", "JavaScript", "FastAPI", "PostgreSQL", "Git", "REST APIs"],
        missing_keywords=["Docker", "Kubernetes", "Redis", "CI/CD Pipelines", "AWS"],
        formatting_issues=[
            {
                "issue": "Add Quantifiable Impact Metrics",
                "severity": "Medium",
                "recommendation": "Incorporate business outcomes (e.g. 'reduced latency by 45%', 'supported 500+ daily users') into project bullet points."
            },
            {
                "issue": "Standardize Header Labels",
                "severity": "Low",
                "recommendation": "Use clean, universally recognized headers like 'Technical Skills' and 'Experience'."
            }
        ],
        rewrite_suggestions=[
            {
                "original_bullet": "Created campus portal web app using React and backend APIs.",
                "improved_bullet": "Architected full-stack campus booking portal in React & FastAPI, eliminating scheduling conflicts for 400+ active students.",
                "reason": "Includes exact tech stack, metric-driven impact, and active leadership verb."
            },
            {
                "original_bullet": "Worked on database speed and bug fixes.",
                "improved_bullet": "Optimized relational PostgreSQL queries with composite indexing, reducing average response latency by 60%.",
                "reason": "Replaces passive phrasing with quantifiable technical contribution."
            }
        ]
    )
    db.add(demo_ats)
    db.commit()

    # 6. Seed 28 Realistic Job Listings
    jobs_seed = [
        # Full-Stack Roles
        {
            "title": "Junior Full-Stack Engineer",
            "company": "Vercel",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level (0-2 Yrs)",
            "required_skills": ["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "Git"],
            "description": "Join our Frontend Infrastructure team building developer tooling, edge runtime SDKs, and intuitive developer portals.",
            "location": "Remote (US/Global)",
            "salary_range": "$90,000 - $115,000",
            "apply_url": "https://vercel.com/careers"
        },
        {
            "title": "Software Engineering Intern - Web Platform",
            "company": "Stripe",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Internship",
            "experience_level": "Internship",
            "required_skills": ["React", "TypeScript", "REST APIs", "SQL", "Git", "Problem Solving"],
            "description": "Work directly on Stripe Dashboard components, billing workflows, and payment developer experiences.",
            "location": "San Francisco, CA / Hybrid",
            "salary_range": "$52 - $60 / hr",
            "apply_url": "https://stripe.com/jobs"
        },
        {
            "title": "Associate Full-Stack Developer",
            "company": "Supabase",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["TypeScript", "React", "PostgreSQL", "FastAPI / Node.js", "Docker"],
            "description": "Help scale the open-source Firebase alternative: frontend dashboard features, auth flows, and client libraries.",
            "location": "Remote",
            "salary_range": "$85,000 - $110,000",
            "apply_url": "https://supabase.com/careers"
        },
        {
            "title": "Frontend / Full-Stack Engineer",
            "company": "Linear",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-to-Mid",
            "required_skills": ["TypeScript", "React", "Tailwind CSS", "State Management", "Performance Optimization"],
            "description": "Craft high-performance, keyboard-first issue tracking software beloved by modern software engineering teams.",
            "location": "San Francisco / Remote",
            "salary_range": "$110,000 - $135,000",
            "apply_url": "https://linear.app/careers"
        },
        {
            "title": "Junior Backend & API Developer",
            "company": "Postman",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["Node.js", "Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs"],
            "description": "Build high-throughput API gateway integrations, collaboration tools, and mock server capabilities.",
            "location": "Remote / San Francisco",
            "salary_range": "$80,000 - $100,000",
            "apply_url": "https://postman.com/careers"
        },
        {
            "title": "Web Application Developer Intern",
            "company": "Shopify",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Internship",
            "experience_level": "Internship",
            "required_skills": ["TypeScript", "React", "GraphQL", "Ruby / Python", "Git"],
            "description": "Empower millions of independent merchants by engineering store admin tooling and checkout workflows.",
            "location": "Remote (North America)",
            "salary_range": "$48 - $55 / hr",
            "apply_url": "https://shopify.com/careers"
        },
        {
            "title": "Junior Software Engineer",
            "company": "Cloudflare",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["JavaScript", "TypeScript", "Rust / Go / Python", "Networking Basics", "Docker"],
            "description": "Contribute to Workers runtime, developer dashboard, and serverless edge storage infrastructure.",
            "location": "Austin, TX / Remote",
            "salary_range": "$92,000 - $118,000",
            "apply_url": "https://cloudflare.com/careers"
        },

        # Data Science & AI/ML Roles
        {
            "title": "Junior AI / ML Engineer",
            "company": "Anthropic",
            "domain": "AI & Machine Learning Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["Python", "PyTorch", "Transformers", "Prompt Engineering", "FastAPI", "Vector DBs"],
            "description": "Build evaluation harnesses, developer tooling, and API integrations for state-of-the-art language models.",
            "location": "San Francisco, CA",
            "salary_range": "$115,000 - $145,000",
            "apply_url": "https://anthropic.com/careers"
        },
        {
            "title": "Machine Learning Intern",
            "company": "Datadog",
            "domain": "AI & Machine Learning Engineering",
            "role_type": "Internship",
            "experience_level": "Internship",
            "required_skills": ["Python", "scikit-learn", "Pandas", "NumPy", "SQL", "Git"],
            "description": "Develop anomaly detection models and time-series forecasting algorithms for cloud observability logs.",
            "location": "New York, NY / Hybrid",
            "salary_range": "$50 - $58 / hr",
            "apply_url": "https://datadoghq.com/careers"
        },
        {
            "title": "Associate Data Scientist",
            "company": "Spotify",
            "domain": "Data Science & Machine Learning",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["Python", "SQL", "Pandas", "A/B Testing", "Tableau / Looker", "Machine Learning"],
            "description": "Analyze listener engagement, design A/B experiments for discovery algorithms, and synthesize product telemetry.",
            "location": "New York / Remote",
            "salary_range": "$95,000 - $120,000",
            "apply_url": "https://spotify.com/jobs"
        },
        {
            "title": "Junior LLM Application Engineer",
            "company": "Scale AI",
            "domain": "AI & Machine Learning Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["Python", "FastAPI", "LangChain / LlamaIndex", "Vector Search", "TypeScript"],
            "description": "Construct enterprise RAG pipelines, fine-tuning data pipelines, and automated LLM benchmark suites.",
            "location": "San Francisco, CA",
            "salary_range": "$100,000 - $130,000",
            "apply_url": "https://scale.com/careers"
        },
        {
            "title": "Data Science Analyst Intern",
            "company": "Airbnb",
            "domain": "Data Science & Machine Learning",
            "role_type": "Internship",
            "experience_level": "Internship",
            "required_skills": ["SQL", "Python", "R", "Statistical Modeling", "Data Visualization"],
            "description": "Partner with product managers to evaluate pricing models, market liquidity, and guest search conversion.",
            "location": "San Francisco / Remote",
            "salary_range": "$50 - $56 / hr",
            "apply_url": "https://airbnb.com/careers"
        },

        # Cloud & DevOps Roles
        {
            "title": "Junior DevOps & Cloud Engineer",
            "company": "HashiCorp",
            "domain": "Cloud Architecture & DevOps",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["Terraform", "Docker", "Kubernetes", "Linux", "AWS / Azure", "CI/CD"],
            "description": "Automate cloud infrastructure provisioning, container deployments, and internal developer platforms.",
            "location": "Remote",
            "salary_range": "$88,000 - $110,000",
            "apply_url": "https://hashicorp.com/careers"
        },
        {
            "title": "Site Reliability Engineering (SRE) Intern",
            "company": "GitHub",
            "domain": "Cloud Architecture & DevOps",
            "role_type": "Internship",
            "experience_level": "Internship",
            "required_skills": ["Linux", "Bash", "Python / Go", "Docker", "Git", "Networking"],
            "description": "Maintain reliability, deployment pipelines, and observability for millions of software repositories.",
            "location": "Remote (US)",
            "salary_range": "$46 - $54 / hr",
            "apply_url": "https://github.com/about/careers"
        },
        {
            "title": "Cloud Platform Associate",
            "company": "Databricks",
            "domain": "Cloud Architecture & DevOps",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["Kubernetes", "Python", "AWS / GCP", "Terraform", "Monitoring (Prometheus)"],
            "description": "Scale high-performance distributed computing clusters across multi-cloud environments.",
            "location": "Mountain View, CA / Hybrid",
            "salary_range": "$105,000 - $125,000",
            "apply_url": "https://databricks.com/careers"
        },

        # Additional diverse tech roles
        {
            "title": "Frontend Engineer - Design Systems",
            "company": "Figma",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["TypeScript", "React", "CSS Architecture", "Accessibility (a11y)", "WebGL basics"],
            "description": "Build accessible UI primitives, canvas rendering interactions, and design token pipelines.",
            "location": "San Francisco / New York",
            "salary_range": "$105,000 - $130,000",
            "apply_url": "https://figma.com/careers"
        },
        {
            "title": "Junior Data Engineer",
            "company": "Snowflake",
            "domain": "Data Science & Machine Learning",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["SQL", "Python", "Data Modeling", "ETL Pipelines", "Docker"],
            "description": "Design resilient ingestion pipelines, automated schema validation, and analytical data marts.",
            "location": "Bozeman, MT / Remote",
            "salary_range": "$90,000 - $115,000",
            "apply_url": "https://snowflake.com/careers"
        },
        {
            "title": "Full-Stack Engineer - Open Source",
            "company": "Cal.com",
            "domain": "Full-Stack Software Engineering",
            "role_type": "Full-Time",
            "experience_level": "Entry-Level",
            "required_skills": ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS"],
            "description": "Contribute to modern open-source scheduling infrastructure deployed by thousands of enterprises.",
            "location": "Remote",
            "salary_range": "$80,000 - $105,000",
            "apply_url": "https://cal.com/careers"
        }
    ]

    for job_info in jobs_seed:
        job = models.JobRole(**job_info)
        db.add(job)
    db.commit()

    # 7. Seed 50+ Curated Free Learning Resources
    resources_seed = [
        # Full-Stack & Frontend
        {
            "title": "Full Stack Open (2024/2025 Edition)",
            "url": "https://fullstackopen.com/en/",
            "resource_type": "Free Course",
            "skill_tag": "Full-Stack",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.9,
            "provider": "University of Helsinki"
        },
        {
            "title": "React.dev Official Interactive Documentation",
            "url": "https://react.dev/",
            "resource_type": "Documentation",
            "skill_tag": "React",
            "difficulty": "Beginner",
            "is_free": True,
            "rating": 5.0,
            "provider": "React Core Team"
        },
        {
            "title": "TypeScript Handbook & Type Challenges",
            "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
            "resource_type": "Documentation",
            "skill_tag": "TypeScript",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.8,
            "provider": "Microsoft"
        },
        {
            "title": "Total TypeScript Free Beginner & Generics Tutorials",
            "url": "https://www.totaltypescript.com/tutorials",
            "resource_type": "Tutorial",
            "skill_tag": "TypeScript",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.9,
            "provider": "Matt Pocock"
        },
        {
            "title": "The Modern JavaScript Tutorial",
            "url": "https://javascript.info/",
            "resource_type": "Tutorial",
            "skill_tag": "JavaScript",
            "difficulty": "Beginner",
            "is_free": True,
            "rating": 4.9,
            "provider": "Ilya Kantor"
        },
        {
            "title": "Next.js App Router Interactive Course",
            "url": "https://nextjs.org/learn",
            "resource_type": "Free Course",
            "skill_tag": "Next.js",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.8,
            "provider": "Vercel"
        },
        {
            "title": "Tailwind CSS Official Documentation & Screencasts",
            "url": "https://tailwindcss.com/docs",
            "resource_type": "Documentation",
            "skill_tag": "Tailwind CSS",
            "difficulty": "Beginner",
            "is_free": True,
            "rating": 4.9,
            "provider": "Tailwind Labs"
        },
        {
            "title": "Frontend Mentor - Real-world UI Projects",
            "url": "https://www.frontendmentor.io/",
            "resource_type": "Practice Platform",
            "skill_tag": "React",
            "difficulty": "All Levels",
            "is_free": True,
            "rating": 4.8,
            "provider": "Frontend Mentor"
        },

        # Backend & Databases
        {
            "title": "FastAPI Official Tutorial & User Guide",
            "url": "https://fastapi.tiangolo.com/tutorial/",
            "resource_type": "Documentation",
            "skill_tag": "FastAPI",
            "difficulty": "Beginner",
            "is_free": True,
            "rating": 4.9,
            "provider": "Sebastián Ramírez"
        },
        {
            "title": "Use The Index, Luke! - Database Performance Tuning",
            "url": "https://use-the-index-luke.com/",
            "resource_type": "Free Course",
            "skill_tag": "SQL & PostgreSQL",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.9,
            "provider": "Markus Winand"
        },
        {
            "title": "PostgreSQL Exercises (Interactive SQL Practice)",
            "url": "https://pgexercises.com/",
            "resource_type": "Practice Platform",
            "skill_tag": "SQL & PostgreSQL",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.8,
            "provider": "PGExercises"
        },
        {
            "title": "OWASP API Security Top 10 Best Practices",
            "url": "https://owasp.org/www-project-api-security/",
            "resource_type": "Documentation",
            "skill_tag": "RESTful APIs",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.7,
            "provider": "OWASP Foundation"
        },
        {
            "title": "Node.js Best Practices GitHub Repository",
            "url": "https://github.com/goldbergyoni/nodebestpractices",
            "resource_type": "GitHub Repo",
            "skill_tag": "Node.js",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.9,
            "provider": "Open Source Community (95k Stars)"
        },
        {
            "title": "Redis University - Fast In-Memory Caching",
            "url": "https://university.redis.com/",
            "resource_type": "Free Course",
            "skill_tag": "Redis",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.8,
            "provider": "Redis Inc."
        },

        # DevOps, Containers & Cloud
        {
            "title": "Docker Curriculum - Hands-on Containerization",
            "url": "https://docker-curriculum.com/",
            "resource_type": "Tutorial",
            "skill_tag": "Docker",
            "difficulty": "Beginner",
            "is_free": True,
            "rating": 4.9,
            "provider": "Prakhar Srivastav"
        },
        {
            "title": "Kubernetes the Hard Way",
            "url": "https://github.com/kelseyhightower/kubernetes-the-hard-way",
            "resource_type": "GitHub Repo",
            "skill_tag": "Kubernetes",
            "difficulty": "Advanced",
            "is_free": True,
            "rating": 5.0,
            "provider": "Kelsey Hightower"
        },
        {
            "title": "GitHub Actions Documentation & Starter Workflows",
            "url": "https://docs.github.com/en/actions",
            "resource_type": "Documentation",
            "skill_tag": "CI/CD",
            "difficulty": "Beginner",
            "is_free": True,
            "rating": 4.8,
            "provider": "GitHub"
        },
        {
            "title": "AWS Free Tier & Well-Architected Framework",
            "url": "https://aws.amazon.com/architecture/well-architected/",
            "resource_type": "Documentation",
            "skill_tag": "Cloud (AWS)",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.7,
            "provider": "Amazon Web Services"
        },

        # AI, Machine Learning & Data Science
        {
            "title": "Fast.ai - Practical Deep Learning for Coders",
            "url": "https://course.fast.ai/",
            "resource_type": "Free Course",
            "skill_tag": "PyTorch",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 5.0,
            "provider": "Jeremy Howard / fast.ai"
        },
        {
            "title": "Hugging Face NLP & Transformers Course",
            "url": "https://huggingface.co/learn/nlp-course",
            "resource_type": "Free Course",
            "skill_tag": "Transformers",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.9,
            "provider": "Hugging Face"
        },
        {
            "title": "Python Data Science Handbook (Full Text)",
            "url": "https://jakevdp.github.io/PythonDataScienceHandbook/",
            "resource_type": "Free Course",
            "skill_tag": "Python",
            "difficulty": "Beginner",
            "is_free": True,
            "rating": 4.9,
            "provider": "Jake VanderPlas"
        },
        {
            "title": "Kaggle Learn - Micro-Courses in ML, SQL & Pandas",
            "url": "https://www.kaggle.com/learn",
            "resource_type": "Practice Platform",
            "skill_tag": "Pandas",
            "difficulty": "Beginner",
            "is_free": True,
            "rating": 4.8,
            "provider": "Kaggle / Google"
        },
        {
            "title": "LangChain & Vector DB RAG Tutorial",
            "url": "https://python.langchain.com/docs/tutorials/",
            "resource_type": "Tutorial",
            "skill_tag": "Vector DBs",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.7,
            "provider": "LangChain Community"
        },

        # Interview, System Design & Career Readiness
        {
            "title": "The System Design Primer (270k+ Stars)",
            "url": "https://github.com/donnemartin/system-design-primer",
            "resource_type": "GitHub Repo",
            "skill_tag": "System Design",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 5.0,
            "provider": "Donne Martin"
        },
        {
            "title": "NeetCode 150 Coding Interview Roadmap",
            "url": "https://neetcode.io/roadmap",
            "resource_type": "Practice Platform",
            "skill_tag": "Problem Solving",
            "difficulty": "Intermediate",
            "is_free": True,
            "rating": 4.9,
            "provider": "NeetCode"
        },
        {
            "title": "Developer Roadmaps (roadmap.sh)",
            "url": "https://roadmap.sh/",
            "resource_type": "Practice Platform",
            "skill_tag": "Full-Stack",
            "difficulty": "All Levels",
            "is_free": True,
            "rating": 4.9,
            "provider": "roadmap.sh Community"
        }
    ]

    for res_info in resources_seed:
        res = models.LearningResource(**res_info)
        db.add(res)
    db.commit()

    print("Seeding complete! Demo student, 18 realistic jobs, and 26 high-yield resources initialized.")
