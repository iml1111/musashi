"""
Setup configuration for Musashi Backend
"""

from setuptools import setup, find_packages

with open("../README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="musashi-backend",
    version="1.0.0",
    author="Musashi Team",
    author_email="support@musashi.dev",
    description="Musashi - AI Agent Workflow Design Tool Backend",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/imiml/musashi",
    project_urls={
        "Bug Tracker": "https://github.com/imiml/musashi/issues",
        "Documentation": "https://docs.musashi.dev",
        "Source Code": "https://github.com/imiml/musashi",
    },
    packages=find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.12",
        "Framework :: FastAPI",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
    ],
    python_requires=">=3.12",
    install_requires=requirements,
    license="MIT",
    keywords="workflow ai agent design tool fastapi mongodb",
    include_package_data=True,
    zip_safe=False,
)