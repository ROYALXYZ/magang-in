import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import os

# Import local data loader
import data_loader as dl

# Set page config for premium look
st.set_page_config(
    page_title="MagangIn - Tech Career & Internship Analytics",
    page_icon="🌌",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for glassmorphic and premium styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    
    /* Apply modern font global */
    html, body, [class*="css"], .stApp {
        font-family: 'Outfit', sans-serif;
    }
    
    /* Premium Title styling with gradient */
    .dashboard-title {
        font-size: 42px;
        font-weight: 800;
        background: linear-gradient(135deg, #00F2FE 0%, #4FACFE 50%, #7F00FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 5px;
        text-shadow: 0 10px 20px rgba(0, 242, 254, 0.15);
    }
    
    .dashboard-subtitle {
        font-size: 16px;
        color: #94a3b8;
        margin-bottom: 30px;
        font-weight: 400;
    }
    
    /* Glassmorphic Metric Cards */
    .metric-card {
        background: rgba(17, 24, 39, 0.6);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 24px 15px;
        text-align: center;
        box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.25);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin-bottom: 20px;
    }
    .metric-card:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 242, 254, 0.3);
        box-shadow: 0 15px 35px 0 rgba(0, 242, 254, 0.15);
    }
    .metric-title {
        font-size: 13px;
        color: #94a3b8;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
    }
    .metric-value {
        font-size: 38px;
        font-weight: 800;
        background: linear-gradient(90deg, #00F2FE 0%, #4FACFE 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 4px;
        line-height: 1.1;
    }
    .metric-value-accent {
        background: linear-gradient(90deg, #FF007F 0%, #7F00FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .metric-subtitle {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
    }
    
    /* Styled container panels */
    .glass-panel {
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 25px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    }
    
    .glass-header {
        font-size: 20px;
        font-weight: 700;
        color: #f8fafc;
        margin-bottom: 15px;
        border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    /* Custom Sidebar styling */
    section[data-testid="stSidebar"] {
        background-color: #0d1117;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .sidebar-logo {
        text-align: center;
        padding: 15px 0 25px 0;
    }
    .sidebar-title {
        font-size: 24px;
        font-weight: 800;
        background: linear-gradient(90deg, #00F2FE 0%, #7F00FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: 0.5px;
    }
    .sidebar-tagline {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 4px;
    }
    
    /* Interactive match result cards */
    .match-card {
        background: rgba(16, 185, 129, 0.05);
        border: 1.5px solid rgba(16, 185, 129, 0.2);
        border-radius: 12px;
        padding: 18px;
        margin-top: 15px;
    }
    .match-header {
        color: #10b981;
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 5px;
    }
    
    .gap-card {
        background: rgba(239, 68, 68, 0.05);
        border: 1.5px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        padding: 18px;
        margin-top: 15px;
    }
    .gap-header {
        color: #ef4444;
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 5px;
    }
    
    /* Checkbox list styled tags */
    .skill-tag {
        display: inline-block;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 4px 12px;
        margin: 4px;
        font-size: 13px;
        color: #e2e8f0;
    }
    .skill-tag-have {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #a7f3d0;
    }
    .skill-tag-missing {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: #fde68a;
    }
    
</style>
""", unsafe_allow_html=True)

# Default Fallback skills for the 27 Roles
DEFAULT_ROLE_SKILLS = {
    'Data Scientist': ['python', 'sql', 'pandas', 'numpy', 'scikit-learn', 'machine learning', 'git', 'statistics', 'deep learning'],
    'Data Analyst': ['sql', 'excel', 'python', 'tableau', 'power bi', 'pandas', 'git', 'statistics', 'data visualization'],
    'Data Engineer': ['sql', 'python', 'spark', 'hadoop', 'airflow', 'aws', 'docker', 'database', 'scala', 'etl'],
    'Machine Learning Engineer': ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'numpy', 'git', 'docker', 'mlops', 'gpu'],
    'AI Engineer': ['python', 'pytorch', 'tensorflow', 'openai', 'llm', 'git', 'docker', 'api', 'nlp'],
    'Frontend Developer': ['javascript', 'html', 'css', 'react', 'vue', 'git', 'typescript', 'tailwind', 'sass', 'webpack'],
    'Backend Developer': ['python', 'sql', 'nodejs', 'express', 'django', 'postgresql', 'git', 'docker', 'api', 'go', 'php'],
    'Full Stack Developer': ['javascript', 'html', 'css', 'react', 'nodejs', 'sql', 'git', 'api', 'typescript', 'mongodb'],
    'Web Developer': ['html', 'css', 'javascript', 'php', 'mysql', 'wordpress', 'git', 'bootstrap', 'jquery'],
    'Android Developer': ['kotlin', 'java', 'android studio', 'git', 'api', 'firebase', 'sqlite'],
    'iOS Developer': ['swift', 'xcode', 'git', 'api', 'ios', 'cocoapods', 'objective-c'],
    'Mobile Developer (General)': ['flutter', 'react native', 'dart', 'javascript', 'git', 'api', 'firebase', 'kotlin'],
    'DevOps Engineer': ['docker', 'kubernetes', 'jenkins', 'git', 'aws', 'linux', 'ci/cd', 'terraform', 'bash'],
    'Cloud Engineer': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'terraform', 'linux', 'cloud architecture'],
    'Cyber Security': ['security', 'linux', 'networking', 'penetration testing', 'wireshark', 'git', 'firewall', 'cryptography', 'siem'],
    'Network Engineer': ['networking', 'cisco', 'ccna', 'routing', 'switching', 'firewall', 'linux', 'dns'],
    'System Administrator': ['linux', 'windows server', 'active directory', 'networking', 'bash', 'security', 'virtualization', 'powershell'],
    'Database Administrator': ['sql', 'mysql', 'postgresql', 'oracle', 'database tuning', 'backup', 'nosql', 'mongodb'],
    'IT Support': ['windows', 'troubleshooting', 'networking', 'hardware', 'customer service', 'active directory', 'support'],
    'UI/UX Designer': ['figma', 'sketch', 'adobe xd', 'wireframing', 'prototyping', 'user research', 'ui', 'ux', 'interaction design'],
    'Product Manager': ['product management', 'agile', 'scrum', 'jira', 'analytics', 'communication', 'roadmap', 'market research'],
    'QA Engineer': ['selenium', 'qa', 'testing', 'postman', 'cypress', 'git', 'automation', 'manual testing', 'junit'],
    'Software Architect': ['design patterns', 'microservices', 'cloud architecture', 'system design', 'uml', 'security', 'kubernetes'],
    'Game Developer': ['unity', 'c#', 'c++', 'unreal engine', '3d graphics', 'git', 'physics', 'shaders'],
    'Blockchain Developer': ['solidity', 'ethereum', 'smart contracts', 'web3.js', 'cryptography', 'rust', 'git', 'go'],
    'Embedded Systems Engineer': ['c', 'c++', 'microcontrollers', 'rtos', 'iot', 'hardware', 'assembly', 'firmware'],
    'Technical Writer': ['technical writing', 'documentation', 'markdown', 'git', 'api documentation', 'confluence', 'technical documentation'],
    'Software Engineer (General)': ['python', 'java', 'c++', 'git', 'data structures', 'algorithms', 'sql', 'software engineering']
}

# Roadmap links for the standard roles
ROADMAP_MAPPING = {
    'Data Scientist': 'https://roadmap.sh/ai-data-scientist',
    'Data Analyst': 'https://roadmap.sh/data-analyst',
    'Data Engineer': 'https://roadmap.sh/data-analyst', # closest fallback
    'Machine Learning Engineer': 'https://roadmap.sh/ai-data-scientist',
    'AI Engineer': 'https://roadmap.sh/ai-data-scientist',
    'Frontend Developer': 'https://roadmap.sh/frontend',
    'Backend Developer': 'https://roadmap.sh/backend',
    'Full Stack Developer': 'https://roadmap.sh/full-stack',
    'Web Developer': 'https://roadmap.sh/frontend',
    'Android Developer': 'https://roadmap.sh/android',
    'iOS Developer': 'https://roadmap.sh/ios',
    'Mobile Developer (General)': 'https://roadmap.sh/android',
    'DevOps Engineer': 'https://roadmap.sh/devops',
    'Cloud Engineer': 'https://roadmap.sh/devops',
    'Cyber Security': 'https://roadmap.sh/cyber-security',
    'Network Engineer': 'https://roadmap.sh/computer-science',
    'System Administrator': 'https://roadmap.sh/computer-science',
    'Database Administrator': 'https://roadmap.sh/computer-science',
    'IT Support': 'https://roadmap.sh/computer-science',
    'UI/UX Designer': 'https://roadmap.sh/ux-design',
    'Product Manager': 'https://roadmap.sh/product-manager',
    'QA Engineer': 'https://roadmap.sh/qa',
    'Software Architect': 'https://roadmap.sh/software-architect',
    'Game Developer': 'https://roadmap.sh/game-developer',
    'Blockchain Developer': 'https://roadmap.sh/blockchain',
    'Embedded Systems Engineer': 'https://roadmap.sh/computer-science',
    'Technical Writer': 'https://roadmap.sh/computer-science',
    'Software Engineer (General)': 'https://roadmap.sh/computer-science'
}

# 1. LOAD DATASETS WITH ERROR HANDLING
try:
    df_local = dl.load_local_data()
    df_global = dl.load_global_data()
    df_apps = dl.load_applicant_data()
    data_loaded = True
except Exception as e:
    st.error(f"⚠️ Terjadi kesalahan saat membaca dataset: {e}")
    st.info("Pastikan Anda berada di direktori project root dan folder 'data' memiliki file CSV yang sesuai.")
    data_loaded = False

if data_loaded:
    # --- SIDEBAR NAVIGATION ---
    with st.sidebar:
        st.markdown("""
            <div class="sidebar-logo">
                <div class="sidebar-title">🌌 MagangIn</div>
                <div class="sidebar-tagline">Tech Talent & Market Intelligence</div>
            </div>
        """, unsafe_allow_html=True)
        
        # Premium navigation choices
        page = st.radio(
            "Pilih Halaman Navigasi:",
            [
                "Ringkasan Eksekutif",
                "Pasar Magang Indonesia",
                "Pasar Tech Global",
                "Benchmarking (Indo vs Global)",
                "Talent Pool & Kelayakan"
            ]
        )
        
        st.markdown("---")
        st.markdown("""
            <div style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
                <b>Project Magang-In (Data Science)</b><br>
                Menganalisis 201 lowongan magang lokal vs 700+ lowongan global.<br>
                © 2026 DBS DS Team
            </div>
        """, unsafe_allow_html=True)

    # --- PAGE 1: EXECUTIVE SUMMARY ---
    if page == "Ringkasan Eksekutif":
        st.markdown('<div class="dashboard-title">🌌 Ringkasan Analisis Job Market Tech</div>', unsafe_allow_html=True)
        st.markdown('<div class="dashboard-subtitle">Benchmark kebutuhan skill lowongan magang lokal (Indonesia) dengan job market global untuk mengidentifikasi skill gap.</div>', unsafe_allow_html=True)
        
        # KPI Row
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown("""
                <div class="metric-card">
                    <div class="metric-title">Lowongan Magang Indo</div>
                    <div class="metric-value">201</div>
                    <div class="metric-subtitle">Glints, JobStreet, Kalibrr</div>
                </div>
            """, unsafe_allow_html=True)
        with col2:
            st.markdown("""
                <div class="metric-card">
                    <div class="metric-title">Lowongan Kerja Global</div>
                    <div class="metric-value">734</div>
                    <div class="metric-subtitle">Kaggle Tech Dataset 2025</div>
                </div>
            """, unsafe_allow_html=True)
        with col3:
            st.markdown("""
                <div class="metric-card">
                    <div class="metric-title">Role Terpopuler Lokal</div>
                    <div class="metric-value metric-value-accent">Backend</div>
                    <div class="metric-subtitle">22.4% dari total lowongan</div>
                </div>
            """, unsafe_allow_html=True)
        with col4:
            st.markdown("""
                <div class="metric-card">
                    <div class="metric-title">Rata-rata Skill Lokal</div>
                    <div class="metric-value">5.0</div>
                    <div class="metric-subtitle">Skill per lowongan magang</div>
                </div>
            """, unsafe_allow_html=True)
            
        # Highlight narrative & Side-by-side roles
        col_left, col_right = st.columns([1, 1.2])
        
        with col_left:
            st.markdown("""
                <div class="glass-panel" style="height: 100%;">
                    <div class="glass-header">💡 Narasi & Kesimpulan Utama</div>
                    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                        <b>1. Realita "Palugada" vs Spesialisasi:</b><br>
                        Industri di Indonesia cenderung menuntut mahasiswa magang menguasai banyak skill sekaligus (all-rounder), dengan rata-rata <b>5.0 skill</b> per lowongan. Sebaliknya, pasar global lebih mengutamakan <b>spesialisasi mendalam</b> (fokus pada 3-5 skill utama per role).
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                        <b>2. Kesenjangan Skill (Skill Gap):</b><br>
                        Pasar Indonesia masih didominasi oleh fondasi <i>Web Development</i> (SQL, JavaScript, CSS, PHP). Sementara itu, tren global menuntut keahlian advanced seperti <i>Cloud Computing (AWS/Azure)</i>, <i>AI/ML</i>, dan <i>Cybersecurity</i>.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                        <b>3. Tiket Masuk Utama:</b><br>
                        Untuk lulusan lokal yang ingin kompetitif, menguasai <b>SQL + Git + 1 Bahasa Utama (Javascript/Python/Java)</b> adalah fondasi mutlak yang paling banyak diminta di pasar kerja.
                    </p>
                </div>
            """, unsafe_allow_html=True)
            
        with col_right:
            # Let's chart the role distribution in local vs global
            local_roles = df_local['role_standard'].value_counts().head(10).reset_index()
            local_roles.columns = ['Role', 'Lokal (Indo)']
            
            global_roles = df_global['role_standard'].value_counts().head(10).reset_index()
            global_roles.columns = ['Role', 'Global']
            
            # Combine for comparison
            merged_roles = pd.merge(local_roles, global_roles, on='Role', how='outer').fillna(0)
            
            fig = go.Figure()
            fig.add_trace(go.Bar(
                y=merged_roles['Role'],
                x=merged_roles['Lokal (Indo)'],
                name='Lokal (Indo Internship)',
                orientation='h',
                marker=dict(color='rgba(255, 0, 127, 0.75)', line=dict(color='rgba(255, 0, 127, 1.0)', width=1.5))
            ))
            fig.add_trace(go.Bar(
                y=merged_roles['Role'],
                x=merged_roles['Global'],
                name='Global Tech Jobs',
                orientation='h',
                marker=dict(color='rgba(0, 242, 254, 0.75)', line=dict(color='rgba(0, 242, 254, 1.0)', width=1.5))
            ))
            
            fig.update_layout(
                title='<b>Perbandingan Ketersediaan Lowongan Top 10 Roles</b>',
                barmode='group',
                template='plotly_dark',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                height=350,
                margin=dict(l=10, r=10, t=40, b=10),
                yaxis=dict(categoryorder='total ascending', gridcolor='rgba(255,255,255,0.05)'),
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)')
            )
            
            st.plotly_chart(fig, use_container_width=True)

        # Comparative complexity card row
        st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
        st.markdown('<div class="glass-header">⚡ Ringkasan Statistik Kompleksitas Skill</div>', unsafe_allow_html=True)
        
        # We can plot a comparison of skill counts
        col_comp_1, col_comp_2 = st.columns([1.5, 1])
        with col_comp_1:
            df_comp_g = pd.DataFrame({'Market': 'Global Market (Spesialis)', 'Jumlah Skill': df_global['skills_count']})
            df_comp_l = pd.DataFrame({'Market': 'Indonesia Market (All-rounder)', 'Jumlah Skill': df_local['skills_count']})
            df_comp = pd.concat([df_comp_g, df_comp_l])
            
            fig_box = px.box(
                df_comp, 
                x='Market', 
                y='Jumlah Skill', 
                color='Market',
                color_discrete_map={'Global Market (Spesialis)': '#00F2FE', 'Indonesia Market (All-rounder)': '#FF007F'},
                points="all",
                title="<b>Distribusi Jumlah Skill yang Diminta (Complexity)</b>"
            )
            fig_box.update_layout(
                template='plotly_dark',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                height=300,
                margin=dict(l=10, r=10, t=40, b=10),
                showlegend=False,
                yaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)')
            )
            st.plotly_chart(fig_box, use_container_width=True)
        
        with col_comp_2:
            st.markdown("""
                <div style="padding-top: 15px;">
                    <h4 style="color: #00F2FE; margin-bottom: 10px;">Mengapa Angka ini Penting?</h4>
                    <p style="font-size: 14px; line-height: 1.5; color: #94a3b8;">
                        Dari box plot di samping, terlihat median skill yang diminta lowongan magang Indonesia adalah <b>5 skill</b> (dengan ekor sebaran yang panjang hingga 12+ skill), sedangkan pasar global cenderung stabil dengan median yang mirip namun rentang yang lebih ketat, didukung data bahwa job global berfokus pada <b>spesialisasi</b> (hanya mencantumkan tool-tool vital role tersebut).
                    </p>
                    <p style="font-size: 14px; line-height: 1.5; color: #94a3b8;">
                        Mahasiswa di Indonesia harus siap mengadopsi profil skill berbentuk <b>"T-Shaped"</b>: memiliki pemahaman general yang cukup luas, namun mempunyai 1 atau 2 keahlian spesialisasi yang sangat mendalam.
                    </p>
                </div>
            """, unsafe_allow_html=True)
            
        st.markdown('</div>', unsafe_allow_html=True)

    # --- PAGE 2: LOCAL MARKET ---
    elif page == "Pasar Magang Indonesia":
        st.markdown('<div class="dashboard-title">🇮🇩 Landscape Magang Tech Indonesia</div>', unsafe_allow_html=True)
        st.markdown('<div class="dashboard-subtitle">Analisis detail lowongan magang teknologi di Pulau Jawa (Jabodetabek, Jawa Timur, Yogyakarta, Jawa Barat, dll).</div>', unsafe_allow_html=True)
        
        # Filter panel
        st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
        st.write("🔍 **Filter Visualisasi:**")
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            selected_regions = st.multiselect(
                "Pilih Wilayah (Region):",
                options=df_local['region'].unique(),
                default=df_local['region'].unique()
            )
        with col_f2:
            selected_sources = st.multiselect(
                "Pilih Platform Source:",
                options=df_local['source'].unique(),
                default=df_local['source'].unique()
            )
            
        # Apply filters
        df_local_filtered = df_local[
            (df_local['region'].isin(selected_regions)) & 
            (df_local['source'].isin(selected_sources))
        ]
        st.markdown('</div>', unsafe_allow_html=True)
        
        if df_local_filtered.empty:
            st.warning("Data kosong setelah difilter. Silakan pilih wilayah atau platform lain.")
        else:
            # Metrics
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-title">Jumlah Lowongan Terfilter</div>
                        <div class="metric-value">{len(df_local_filtered)}</div>
                        <div class="metric-subtitle">Dari total 201 lowongan</div>
                    </div>
                """, unsafe_allow_html=True)
            with col2:
                avg_sk = df_local_filtered['skills_count'].mean()
                st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-title">Rerata Skill Diminta</div>
                        <div class="metric-value">{avg_sk:.2f}</div>
                        <div class="metric-subtitle">Kebutuhan Skill per Job</div>
                    </div>
                """, unsafe_allow_html=True)
            with col3:
                top_company = df_local_filtered['company_name'].value_counts().index[0] if not df_local_filtered.empty else "N/A"
                top_company_count = df_local_filtered['company_name'].value_counts().values[0] if not df_local_filtered.empty else 0
                st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-title">Top Employer</div>
                        <div class="metric-value metric-value-accent" style="font-size: 24px; padding-top: 8px;">{top_company}</div>
                        <div class="metric-subtitle">{top_company_count} lowongan magang</div>
                    </div>
                """, unsafe_allow_html=True)
            with col4:
                top_city = df_local_filtered['location_city'].value_counts().index[0].title() if not df_local_filtered.empty else "N/A"
                st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-title">Kota Teraktif</div>
                        <div class="metric-value">{top_city}</div>
                        <div class="metric-subtitle">Pusat lowongan magang</div>
                    </div>
                """, unsafe_allow_html=True)
                
            # Row 1: Roles & Geography
            col_l1, col_l2 = st.columns(2)
            with col_l1:
                role_counts = df_local_filtered['role_standard'].value_counts().reset_index()
                role_counts.columns = ['Role', 'Jumlah']
                fig_roles = px.bar(
                    role_counts, 
                    x='Jumlah', 
                    y='Role', 
                    orientation='h', 
                    title='<b>Distribusi Kategori Role Magang</b>',
                    color='Jumlah',
                    color_continuous_scale='plasma'
                )
                fig_roles.update_layout(
                    template='plotly_dark',
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    yaxis=dict(categoryorder='total ascending', gridcolor='rgba(255,255,255,0.05)'),
                    xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                    height=400,
                    margin=dict(l=10, r=10, t=40, b=10)
                )
                st.plotly_chart(fig_roles, use_container_width=True)
                
            with col_l2:
                # Tree Map of Region and City
                fig_geo = px.treemap(
                    df_local_filtered, 
                    path=['region', 'location_city'],
                    title='<b>Distribusi Lowongan: Wilayah & Kota</b>',
                    color='skills_count',
                    color_continuous_scale='viridis',
                    labels={'skills_count': 'Rerata Skill'}
                )
                fig_geo.update_layout(
                    template='plotly_dark',
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    height=400,
                    margin=dict(l=10, r=10, t=40, b=10)
                )
                st.plotly_chart(fig_geo, use_container_width=True)
                
            # Row 2: Top Skills and Source Platforms
            col_l3, col_l4 = st.columns([1.5, 1])
            with col_l3:
                # Get Top Skills
                top_skills_df = dl.get_top_skills(df_local_filtered, top_n=15)
                fig_skills = px.bar(
                    top_skills_df, 
                    x='Frequency', 
                    y='Skill', 
                    orientation='h',
                    title='<b>Top 15 Skill Terpopuler di Indonesia</b>',
                    color='Percentage',
                    color_continuous_scale='sunset'
                )
                fig_skills.update_layout(
                    template='plotly_dark',
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    yaxis=dict(categoryorder='total ascending', gridcolor='rgba(255,255,255,0.05)'),
                    xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                    height=380,
                    margin=dict(l=10, r=10, t=40, b=10)
                )
                st.plotly_chart(fig_skills, use_container_width=True)
                
            with col_l4:
                # Source platform breakdown
                src_counts = df_local_filtered['source'].value_counts().reset_index()
                src_counts.columns = ['Platform', 'Jumlah']
                fig_src = px.pie(
                    src_counts, 
                    values='Jumlah', 
                    names='Platform', 
                    hole=0.4,
                    title='<b>Sumber Lowongan Magang</b>',
                    color_discrete_sequence=px.colors.sequential.RdBu
                )
                fig_src.update_layout(
                    template='plotly_dark',
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    height=380,
                    margin=dict(l=10, r=10, t=40, b=10)
                )
                st.plotly_chart(fig_src, use_container_width=True)
                
            # Row 3: Co-occurrence Tool
            st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
            st.markdown('<div class="glass-header">🔗 Skill Co-occurrence (Pasangan Skill Populer)</div>', unsafe_allow_html=True)
            
            st.write("Pilih salah satu skill kunci di bawah ini untuk melihat pasangan skill yang paling sering dipersyaratkan bersamanya:")
            
            # List some top local skills to choose from
            top_10_skills = dl.get_top_skills(df_local_filtered, top_n=10)['Skill'].tolist()
            selected_co_skill = st.selectbox("Pilih Skill Kunci:", options=top_10_skills, index=0)
            
            co_skills_df = dl.get_cooccurring_skills(df_local_filtered, selected_co_skill, limit=10)
            
            if co_skills_df.empty:
                st.info(f"Tidak ditemukan skill lain yang berpasangan dengan '{selected_co_skill}'.")
            else:
                col_co1, col_co2 = st.columns([1.5, 1])
                with col_co1:
                    fig_co = px.bar(
                        co_skills_df, 
                        x='Count', 
                        y='Skill', 
                        orientation='h',
                        title=f"<b>Skill yang sering muncul bersama '{selected_co_skill}'</b>",
                        color='Confidence',
                        color_continuous_scale='tealgrn',
                        labels={'Confidence': 'Confidence (%)'}
                    )
                    fig_co.update_layout(
                        template='plotly_dark',
                        paper_bgcolor='rgba(0,0,0,0)',
                        plot_bgcolor='rgba(0,0,0,0)',
                        yaxis=dict(categoryorder='total ascending'),
                        height=300,
                        margin=dict(l=10, r=10, t=40, b=10)
                    )
                    st.plotly_chart(fig_co, use_container_width=True)
                    
                with col_co2:
                    st.markdown(f"""
                        <div style="padding-top: 20px;">
                            <h4 style="color: #00CC96;">Bagaimana membaca data ini?</h4>
                            <p style="font-size: 14px; line-height: 1.5; color: #94a3b8;">
                                Ketika perusahaan mencari kandidat dengan skill <b>'{selected_co_skill}'</b>, mereka juga sangat mengharapkan kandidat menguasai skill pendukung lainnya.
                            </p>
                            <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                                Rekomendasi: Jika kamu sedang mempelajari <b>{selected_co_skill}</b>, pertimbangkan untuk mempelajari <b>{co_skills_df['Skill'].iloc[0]}</b> (Confidence {co_skills_df['Confidence'].iloc[0]:.1f}%) dan <b>{co_skills_df['Skill'].iloc[1] if len(co_skills_df) > 1 else ''}</b> sebagai paket keahlian komplit yang bernilai tinggi!
                            </p>
                        </div>
                    """, unsafe_allow_html=True)
            st.markdown('</div>', unsafe_allow_html=True)

    # --- PAGE 3: GLOBAL MARKET ---
    elif page == "Pasar Tech Global":
        st.markdown('<div class="dashboard-title">🌎 Tren Pasar Tech Global</div>', unsafe_allow_html=True)
        st.markdown('<div class="dashboard-subtitle">Analisis data lowongan tech internasional (734 entri) untuk memetakan arah tren spesialisasi teknologi dunia.</div>', unsafe_allow_html=True)
        
        # KPI metrics row
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown("""
                <div class="metric-card">
                    <div class="metric-title">Total Lowongan Kerja Global</div>
                    <div class="metric-value">734</div>
                    <div class="metric-subtitle">Kaggle Tech Postings</div>
                </div>
            """, unsafe_allow_html=True)
        with col2:
            st.markdown("""
                <div class="metric-card">
                    <div class="metric-title">Role Global Terbesar</div>
                    <div class="metric-value" style="font-size: 20px; padding-top: 10px;">Software Engineer</div>
                    <div class="metric-subtitle">30.2% dari total lowongan</div>
                </div>
            """, unsafe_allow_html=True)
        with col3:
            st.markdown("""
                <div class="metric-card">
                    <div class="metric-title">Top Global Skill</div>
                    <div class="metric-value metric-value-accent">Python</div>
                    <div class="metric-subtitle">Tersebar di berbagai sub-domain</div>
                </div>
            """, unsafe_allow_html=True)
        with col4:
            st.markdown("""
                <div class="metric-card">
                    <div class="metric-title">Tingkat Spesialisasi</div>
                    <div class="metric-value">Tinggi</div>
                    <div class="metric-subtitle">Fokus pada Core Stack</div>
                </div>
            """, unsafe_allow_html=True)
            
        # Charts row
        col_g1, col_g2 = st.columns(2)
        with col_g1:
            # Global Roles Distribution
            global_role_counts = df_global['role_standard'].value_counts().reset_index()
            global_role_counts.columns = ['Role Standard', 'Jumlah']
            fig_g_roles = px.bar(
                global_role_counts.head(12),
                x='Jumlah',
                y='Role Standard',
                orientation='h',
                title='<b>Top 12 Distribusi Kategori Role Global</b>',
                color='Jumlah',
                color_continuous_scale='viridis'
            )
            fig_g_roles.update_layout(
                template='plotly_dark',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                yaxis=dict(categoryorder='total ascending', gridcolor='rgba(255,255,255,0.05)'),
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                height=400,
                margin=dict(l=10, r=10, t=40, b=10)
            )
            st.plotly_chart(fig_g_roles, use_container_width=True)
            
        with col_g2:
            # Global Skills Distribution
            global_skills_df = dl.get_top_skills(df_global, top_n=15)
            fig_g_skills = px.bar(
                global_skills_df,
                x='Frequency',
                y='Skill',
                orientation='h',
                title='<b>Top 15 Skill Paling Dicari secara Global</b>',
                color='Percentage',
                color_continuous_scale='plasma'
            )
            fig_g_skills.update_layout(
                template='plotly_dark',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                yaxis=dict(categoryorder='total ascending', gridcolor='rgba(255,255,255,0.05)'),
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                height=400,
                margin=dict(l=10, r=10, t=40, b=10)
            )
            st.plotly_chart(fig_g_skills, use_container_width=True)
            
        # Analysis panel
        st.markdown("""
            <div class="glass-panel">
                <div class="glass-header">🌎 Karakteristik Pasar Global</div>
                <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                    Di pasar internasional, kebutuhan industri sangat terdiversifikasi di berbagai bidang spesialis seperti <b>Cyber Security, Cloud Engineer, UI/UX Designer</b>, dan <b>AI Engineer</b>. 
                    Seorang Software Engineer secara global didorong untuk memiliki skill cloud dasar (seperti AWS, Docker, Kubernetes) dikombinasikan dengan pemahaman bahasa pemrograman berorientasi objek yang kuat.
                </p>
                <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                    Bandingkan dengan pasar lokal Indonesia, di mana sebaran lowongan didominasi oleh kategori <i>Backend Developer</i> dan <i>IT General/Support</i> karena industri kita masih dalam tahap membangun fondasi infrastruktur digital dasar dan pemeliharaan website.
                </p>
            </div>
        """, unsafe_allow_html=True)

    # --- PAGE 4: BENCHMARKING (COMPARATIVE) ---
    elif page == "Benchmarking (Indo vs Global)":
        st.markdown('<div class="dashboard-title">📊 Perbandingan Pasar: Indo vs Global</div>', unsafe_allow_html=True)
        st.markdown('<div class="dashboard-subtitle">Analisis langsung perbedaan preferensi teknologi dan kualifikasi yang dicari oleh industri lokal dengan global.</div>', unsafe_allow_html=True)
        
        # side by side role comparison (excluding General Software Engineer to focus on specific roles)
        df_local_spec = df_local[df_local['role_standard'] != 'Software Engineer (General)']
        df_global_spec = df_global[df_global['role_standard'] != 'Software Engineer (General)']
        
        st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
        st.markdown('<div class="glass-header">1. Perbandingan Proporsi Top Roles</div>', unsafe_allow_html=True)
        
        l_pct = df_local_spec['role_standard'].value_counts(normalize=True).head(10).reset_index()
        l_pct.columns = ['Role', 'Persentase Lokal (%)']
        l_pct['Persentase Lokal (%)'] *= 100
        
        g_pct = df_global_spec['role_standard'].value_counts(normalize=True).head(10).reset_index()
        g_pct.columns = ['Role', 'Persentase Global (%)']
        g_pct['Persentase Global (%)'] *= 100
        
        merged_pct = pd.merge(l_pct, g_pct, on='Role', how='outer').fillna(0)
        
        fig_role_comp = go.Figure()
        fig_role_comp.add_trace(go.Bar(
            x=merged_pct['Role'],
            y=merged_pct['Persentase Lokal (%)'],
            name='Pasar Magang Lokal (Indo)',
            marker_color='#FF007F'
        ))
        fig_role_comp.add_trace(go.Bar(
            x=merged_pct['Role'],
            y=merged_pct['Persentase Global (%)'],
            name='Pasar Tech Global',
            marker_color='#00F2FE'
        ))
        fig_role_comp.update_layout(
            barmode='group',
            template='plotly_dark',
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            height=350,
            xaxis=dict(tickangle=-25, gridcolor='rgba(255,255,255,0.05)'),
            yaxis=dict(title='Persentase dari total lowongan (%)', gridcolor='rgba(255,255,255,0.05)'),
            margin=dict(l=10, r=10, t=20, b=10)
        )
        st.plotly_chart(fig_role_comp, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Skill comparison and gap
        col_b1, col_b2 = st.columns(2)
        with col_b1:
            st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
            st.markdown('<div class="glass-header">Top 12 Skill di Indonesia</div>', unsafe_allow_html=True)
            local_skills_top = dl.get_top_skills(df_local, top_n=12)
            fig_l_sk = px.bar(
                local_skills_top,
                x='Percentage',
                y='Skill',
                orientation='h',
                color_discrete_sequence=['#FF007F'],
                labels={'Percentage': 'Persentase Lowongan (%)'}
            )
            fig_l_sk.update_layout(
                template='plotly_dark',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                yaxis=dict(categoryorder='total ascending'),
                height=300,
                margin=dict(l=10, r=10, t=10, b=10)
            )
            st.plotly_chart(fig_l_sk, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)
            
        with col_b2:
            st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
            st.markdown('<div class="glass-header">Top 12 Skill di Global</div>', unsafe_allow_html=True)
            global_skills_top = dl.get_top_skills(df_global, top_n=12)
            fig_g_sk = px.bar(
                global_skills_top,
                x='Percentage',
                y='Skill',
                orientation='h',
                color_discrete_sequence=['#00F2FE'],
                labels={'Percentage': 'Persentase Lowongan (%)'}
            )
            fig_g_sk.update_layout(
                template='plotly_dark',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                yaxis=dict(categoryorder='total ascending'),
                height=300,
                margin=dict(l=10, r=10, t=10, b=10)
            )
            st.plotly_chart(fig_g_sk, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)

        # Detailed analysis on Skill Gap
        st.markdown("""
            <div class="glass-panel">
                <div class="glass-header">🔍 Analisis Skill Gap & Dissonansi Teknologi</div>
                <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                    <b>Mengapa ada kesenjangan?</b><br>
                    1. <b>Fokus Database & Framework:</b> Di Indonesia, <b>SQL</b> (34.3%), <b>JavaScript</b> (28.4%), dan <b>CSS/HTML</b> sangat dominan. Industri lokal membutuhkan pembuat frontend-backend web yang cepat siap pakai (banyak PHP dan Java).<br>
                    2. <b>Fokus Cloud & AI:</b> Di pasar global, terdapat demand tinggi terhadap <b>AWS, Docker, Jenkins, Kubernetes</b>, dan metodologi <b>Agile</b> yang terstandarisasi. Ini menunjukkan bahwa pasar global sudah berada di level orkestrasi cloud dan AI production-scale.<br>
                    3. <b>Implikasi Karir Mahasiswa:</b> Mahasiswa Indonesia yang bercita-cita berkarir di perusahaan multinasional atau remote global tidak boleh puas hanya belajar PHP, MySQL, atau CSS. Mereka harus melakukan upskilling mandiri ke arah <i>Cloud Computing (AWS/Docker)</i> dan <i>Automated DevOps pipeline</i>.
                </p>
            </div>
        """, unsafe_allow_html=True)

    # --- PAGE 6: TALENT POOL ---
    elif page == "Talent Pool & Kelayakan":
        st.markdown('<div class="dashboard-title">🎓 Profil & Kelayakan Talent Pool</div>', unsafe_allow_html=True)
        st.markdown('<div class="dashboard-subtitle">Visualisasi data supply mahasiswa pendaftar magang (300 pendaftar) untuk melacak kualifikasi dan status seleksi.</div>', unsafe_allow_html=True)
        
        # KPI metrics row
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-title">Total Talent Terdaftar</div>
                    <div class="metric-value">{len(df_apps)}</div>
                    <div class="metric-subtitle">Mahasiswa pendaftar magang</div>
                </div>
            """, unsafe_allow_html=True)
        with col2:
            avg_gpa = df_apps['CGPA'].mean()
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-title">Rerata CGPA/IPK</div>
                    <div class="metric-value">{avg_gpa:.2f}</div>
                    <div class="metric-subtitle">Skala akademik 4.00</div>
                </div>
            """, unsafe_allow_html=True)
        with col3:
            top_major = df_apps['Major'].value_counts().index[0]
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-title">Jurusan Terbanyak</div>
                    <div class="metric-value metric-value-accent">{top_major}</div>
                    <div class="metric-subtitle">Electrical/Computer Engineering/CS</div>
                </div>
            """, unsafe_allow_html=True)
        with col4:
            accept_rate = (df_apps['Application_Status'] == 'Accepted').mean() * 100
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-title">Lolos Seleksi (Accepted)</div>
                    <div class="metric-value">{accept_rate:.1f}%</div>
                    <div class="metric-subtitle">Rasio penerimaan magang</div>
                </div>
            """, unsafe_allow_html=True)
            
        # Charts Row
        col_t1, col_t2 = st.columns(2)
        with col_t1:
            # CGPA distribution
            fig_gpa = px.histogram(
                df_apps,
                x='CGPA',
                color='Application_Status',
                color_discrete_map={'Accepted': '#10b981', 'Pending': '#f59e0b', 'Rejected': '#ef4444'},
                marginal='box',
                title='<b>Distribusi IPK Berdasarkan Status Aplikasi</b>',
                nbins=20
            )
            fig_gpa.update_layout(
                template='plotly_dark',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                yaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                height=350,
                margin=dict(l=10, r=10, t=40, b=10)
            )
            st.plotly_chart(fig_gpa, use_container_width=True)
            
        with col_t2:
            # Domain and Major
            fig_major = px.bar(
                df_apps.groupby(['Major', 'Application_Status']).size().reset_index(name='Count'),
                x='Major',
                y='Count',
                color='Application_Status',
                color_discrete_map={'Accepted': '#10b981', 'Pending': '#f59e0b', 'Rejected': '#ef4444'},
                title='<b>Distribusi Jurusan Berdasarkan Status Aplikasi</b>',
                barmode='group'
            )
            fig_major.update_layout(
                template='plotly_dark',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                yaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                height=350,
                margin=dict(l=10, r=10, t=40, b=10)
            )
            st.plotly_chart(fig_major, use_container_width=True)
            
        # Interactive Recruiter Search Panel
        st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
        st.markdown('<div class="glass-header">🔍 Portal Pencarian Talent (Recruiter View)</div>', unsafe_allow_html=True)
        
        st.write("Gunakan filter di bawah ini untuk menyaring kandidat terbaik sesuai kualifikasi perusahaan Anda:")
        
        col_s1, col_s2, col_s3 = st.columns(3)
        with col_s1:
            gpa_threshold = st.slider("Minimal IPK (CGPA):", min_value=2.0, max_value=4.0, value=3.20, step=0.1)
        with col_s2:
            filter_major = st.multiselect(
                "Filter Jurusan (Major):",
                options=df_apps['Major'].unique(),
                default=df_apps['Major'].unique()
            )
        with col_s3:
            filter_status = st.multiselect(
                "Status Aplikasi:",
                options=df_apps['Application_Status'].unique(),
                default=['Accepted', 'Pending']
            )
            
        # Apply filter
        df_apps_filtered = df_apps[
            (df_apps['CGPA'] >= gpa_threshold) &
            (df_apps['Major'].isin(filter_major)) &
            (df_apps['Application_Status'].isin(filter_status))
        ]
        
        # Skill keyword filter
        search_skill = st.text_input("Cari Kandidat berdasarkan keyword skill (misal: python, sql, react):").lower().strip()
        if search_skill:
            df_apps_filtered = df_apps_filtered[df_apps_filtered['skills_list'].apply(lambda x: search_skill in x)]
            
        st.write(f"Menampilkan **{len(df_apps_filtered)}** kandidat yang cocok:")
        
        # Select columns to display
        display_cols = ['Name', 'Gender', 'CGPA', 'Major', 'Internship_Domain', 'Skills', 'Years_of_Experience', 'Application_Status', 'Portfolio_Link']
        if not df_apps_filtered.empty:
            # Highlight status column or style dataframe
            st.dataframe(
                df_apps_filtered[display_cols].reset_index(drop=True),
                use_container_width=True
            )
        else:
            st.info("Tidak ada talent yang memenuhi kriteria pencarian Anda.")
            
        st.markdown('</div>', unsafe_allow_html=True)
