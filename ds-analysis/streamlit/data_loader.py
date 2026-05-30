import os
import pandas as pd
import numpy as np
import streamlit as st
from collections import Counter

# Set up paths relative to the file location
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')

def get_data_path(filename):
    return os.path.join(DATA_DIR, filename)

def map_27_roles(text):
    text = str(text).lower()

    # 1. Data & AI
    if 'data scientist' in text or 'data science' in text: return 'Data Scientist'
    elif 'data analyst' in text or 'analytics' in text: return 'Data Analyst'
    elif 'data engineer' in text: return 'Data Engineer'
    elif 'machine learning' in text or 'ml ' in text: return 'Machine Learning Engineer'
    elif 'ai ' in text or 'artificial intelligence' in text: return 'AI Engineer'

    # 2. Web Development
    elif 'frontend' in text or 'front-end' in text or 'front end' in text: return 'Frontend Developer'
    elif 'backend' in text or 'back-end' in text or 'back end' in text: return 'Backend Developer'
    elif 'fullstack' in text or 'full stack' in text: return 'Full Stack Developer'
    elif 'web developer' in text or 'web dev' in text: return 'Web Developer'

    # 3. Mobile Development
    elif 'android' in text: return 'Android Developer'
    elif 'ios' in text: return 'iOS Developer'
    elif 'mobile' in text or 'flutter' in text or 'react native' in text: return 'Mobile Developer (General)'

    # 4. Infrastructure, Cloud & Ops
    elif 'devops' in text: return 'DevOps Engineer'
    elif 'cloud' in text or 'aws' in text or 'azure' in text: return 'Cloud Engineer'
    elif 'cyber' in text or 'security' in text or 'penetration' in text: return 'Cyber Security'
    elif 'network' in text: return 'Network Engineer'
    elif 'system admin' in text or 'sysadmin' in text or 'system engineer' in text: return 'System Administrator'
    elif 'database' in text or 'dba' in text: return 'Database Administrator'
    elif 'it support' in text or 'support engineer' in text or 'it general' in text or 'programmer' in text or 'it support' in text or 'it staff' in text: 
        return 'IT Support'

    # 5. Design & Product
    elif 'ui/ux' in text or 'ui' in text or 'ux' in text or 'designer' in text or 'design' in text: return 'UI/UX Designer'
    elif 'product manager' in text: return 'Product Manager'

    # 6. Quality & Architecture
    elif 'qa' in text or 'quality assurance' in text or 'tester' in text: return 'QA Engineer'
    elif 'architect' in text: return 'Software Architect'

    # 7. Specialized Roles
    elif 'game' in text or 'unity' in text: return 'Game Developer'
    elif 'blockchain' in text or 'web3' in text or 'smart contract' in text: return 'Blockchain Developer'
    elif 'embedded' in text or 'iot' in text: return 'Embedded Systems Engineer'
    elif 'writer' in text or 'documentation' in text: return 'Technical Writer'

    else:
        return 'Software Engineer (General)'

@st.cache_data
def load_local_data():
    """Loads and preprocesses local (Indonesia) internship jobs data."""
    path = get_data_path('magangin_jobs_cleaned.csv')
    if not os.path.exists(path):
        # Fallback to other similar files if name differs
        files = [f for f in os.listdir(DATA_DIR) if 'magangin_jobs_cleaned' in f]
        if files:
            path = get_data_path(files[0])
        else:
            raise FileNotFoundError(f"Local jobs dataset not found at {path}")
            
    df = pd.read_csv(path)
    
    # Preprocess: ensure string format, handle nulls
    df['skills'] = df['skills'].fillna('').astype(str)
    df['skills_list'] = df['skills'].apply(lambda x: [s.strip().lower() for s in x.split(',') if s.strip()])
    
    # Map title to standard role mapping if not already present or needs alignment
    df['role_standard'] = df['title'].apply(map_27_roles)
    
    # Ensure source platform is clean
    df['source'] = df['source'].str.lower().fillna('unknown')
    
    # Group region for consistency
    df['region'] = df['region'].fillna('Lainnya')
    
    return df

@st.cache_data
def load_global_data():
    """Loads and preprocesses global tech jobs data."""
    # We will use 'global_final_for_eda.csv' as it was specifically generated for comparisons,
    # fallback to 'global_jobs_cleaned.csv' if not found.
    path = get_data_path('global_final_for_eda.csv')
    if not os.path.exists(path):
        path = get_data_path('global_jobs_cleaned.csv')
        
    if not os.path.exists(path):
        raise FileNotFoundError("Global jobs dataset not found.")
        
    df = pd.read_csv(path)
    
    # Standardize columns to align with local data
    if 'job_title' in df.columns:
        df = df.rename(columns={'job_title': 'title'})
    if 'skills_cleaned' in df.columns:
        df = df.rename(columns={'skills_cleaned': 'skills'})
    
    df['skills'] = df['skills'].fillna('').astype(str)
    df['skills_list'] = df['skills'].apply(lambda x: [s.strip().lower() for s in x.split(',') if s.strip()])
    
    if 'role_standard' not in df.columns and 'role' in df.columns:
        df = df.rename(columns={'role': 'role_standard'})
    elif 'role_standard' not in df.columns:
        df['role_standard'] = df['title'].apply(map_27_roles)
        
    return df

@st.cache_data
def load_applicant_data():
    """Loads student internship applications data."""
    path = get_data_path('tech_internship_applications.csv')
    if not os.path.exists(path):
        raise FileNotFoundError(f"Applicant dataset not found at {path}")
    
    df = pd.read_csv(path)
    
    # Parse skills
    df['Skills'] = df['Skills'].fillna('').astype(str)
    df['skills_list'] = df['Skills'].apply(lambda x: [s.strip().lower() for s in x.split(',') if s.strip()])
    
    return df

def get_top_skills(df, skills_col='skills_list', top_n=20):
    """Returns top N skills and their frequency count."""
    all_skills = []
    for s_list in df[skills_col]:
        all_skills.extend(s_list)
    counts = Counter(all_skills)
    skill_df = pd.DataFrame(counts.most_common(top_n), columns=['Skill', 'Frequency'])
    skill_df['Percentage'] = (skill_df['Frequency'] / len(df)) * 100
    return skill_df

def get_cooccurring_skills(df, target_skill, skills_col='skills_list', limit=10):
    """Returns skills that most frequently co-occur with a target skill."""
    co_counts = Counter()
    total_with_target = 0
    for s_list in df[skills_col]:
        if target_skill in s_list:
            total_with_target += 1
            for s in s_list:
                if s != target_skill:
                    co_counts[s] += 1
    if total_with_target == 0:
        return pd.DataFrame(columns=['Skill', 'Co-occurrence Count', 'Confidence'])
    
    co_df = pd.DataFrame(co_counts.most_common(limit), columns=['Skill', 'Count'])
    co_df['Confidence'] = (co_df['Count'] / total_with_target) * 100
    return co_df
