# 📦 Dependabot Guide for MeeChain

## 🇹🇭 คู่มือการใช้ Dependabot
## 🇬🇧 Dependabot Usage Guide

---

## 🎯 Overview

Dependabot ช่วยอัปเดต dependencies ของ MeeChain อัตโนมัติทุกสัปดาห์ เพื่อ:
- ลดความเสี่ยงจาก security vulnerabilities
- ทำให้ dependencies ทันสมัยอยู่เสมอ
- ลดงาน manual ในการอัปเดต dependencies

Dependabot automatically updates MeeChain dependencies weekly to:
- Reduce security vulnerability risks
- Keep dependencies up-to-date
- Reduce manual dependency update work

---

## 📋 Configuration Summary

### 🔧 Backend (Python/FastAPI)
- **Schedule:** ทุกวันจันทร์ 09:00 น. (Asia/Bangkok)
- **Directory:** `/meechain-backend`
- **Labels:** `dependencies`, `python`, `backend`
- **Reviewers:** `team-backend`

### 🎨 Frontend (Next.js/React)
- **Schedule:** ทุกวันจันทร์ 09:00 น. (Asia/Bangkok)
- **Directory:** `/meechain-frontend`
- **Labels:** `dependencies`, `npm`, `frontend`
- **Reviewers:** `team-frontend`

### 🚀 GitHub Actions
- **Schedule:** วันจันทร์แรกของเดือน 09:00 น.
- **Directory:** `/`
- **Labels:** `dependencies`, `github-actions`, `ci-cd`
- **Reviewers:** `team-devops`

### 🔒 Security Updates
- **Schedule:** ทุกวัน 06:00 น.
- **Priority:** High/Critical vulnerabilities only
- **Labels:** `security`, `dependencies`, `critical`
- **Reviewers:** `team-security`

---

## 🚀 Workflow เมื่อ Dependabot สร้าง PR

### Step 1: PR Created
```
Dependabot creates PR → ทีมได้รับ notification → PR มี label และ reviewers ที่ถูกต้อง
```

### Step 2: Review Process
1. **Reviewer ตรวจสอบ PR**
   - ตรวจสอบ changelog
   - ตรวจสอบ breaking changes
   - ตรวจสอบ compatibility

2. **Run Tests**
   ```bash
   # Backend tests
   cd meechain-backend
   pytest --cov=./ --cov-report=html
   
   # Frontend tests
   cd meechain-frontend
   npm test
   npm run build
   ```

3. **Verify in Staging** (ถ้าจำเป็น)

### Step 3: Merge & Deploy
1. **Approve PR** เมื่อทุกอย่างผ่าน
2. **Merge PR** โดย Dependabot หรือทีม
3. **CI/CD Pipeline** รันอัตโนมัติ
4. **Deploy to Staging/Production**

---

## 🛡️ Security Updates Process

### Critical Security Updates
```
Security Vulnerability Found → Dependabot creates PR → Security Team Review → Emergency Merge → Immediate Deployment
```

### Security Team Responsibilities
1. **Prioritize review** ของ security PRs
2. **Verify fixes** กับ security advisories
3. **Coordinate deployment** กับ DevOps team
4. **Document** security updates

---

## 🔧 Manual Overrides

### Ignore Specific Updates
```yaml
# ใน .github/dependabot.yml
ignore:
  - dependency-name: "package-name"
    versions: ["< 1.0.0", ">= 2.0.0"]  # Ignore major version updates
```

### Update Dependencies Manually
```bash
# Backend
cd meechain-backend
pip install -U package-name
pip freeze > requirements.txt

# Frontend
cd meechain-frontend
npm update package-name
```

### Force Dependabot to Check Now
1. ไปที่ **Repository Settings**
2. เลือก **Code security and analysis**
3. คลิก **Dependabot**
4. คลิก **Check for updates**

---

## 🧪 Testing Strategy

### Before Merging Dependabot PR
- [ ] **Unit Tests** - ผ่านทั้งหมด
- [ ] **Integration Tests** - ผ่านทั้งหมด
- [ ] **Build** - สำเร็จไม่มี error
- [ ] **Linting** - ผ่านทั้งหมด
- [ ] **Type Checking** - ผ่านทั้งหมด

### After Merging
- [ ] **Staging Deployment** - ทำงานปกติ
- [ ] **Smoke Tests** - ผ่านทั้งหมด
- [ ] **Performance Tests** - ไม่มี regression

---

## 📊 Monitoring & Metrics

### Key Metrics
- **Update Frequency:** จำนวน PRs ต่อสัปดาห์
- **Merge Rate:** เปอร์เซ็นต์ PRs ที่ merge
- **Time to Merge:** เวลาเฉลี่ยจากสร้างถึง merge
- **Security Updates:** จำนวน security fixes

### Dashboard
```
GitHub Insights → Dependabot → Update Frequency, Merge Rate, etc.
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. **Build Failures After Update**
```bash
# Rollback to previous version
git checkout main
git revert <commit-hash>
```

#### 2. **Dependency Conflicts**
```bash
# Resolve conflicts
npm install  # หรือ pip install -r requirements.txt
# Fix package.json/requirements.txt
```

#### 3. **Dependabot Not Creating PRs**
1. ตรวจสอบ `.github/dependabot.yml`
2. ตรวจสอบ repository permissions
3. ตรวจสอบ GitHub Actions settings

#### 4. **Security Updates Not Prioritized**
1. ตรวจสอบ severity levels ใน config
2. ตรวจสอบ security team assignments
3. ตรวจสอบ notification settings

---

## 🎯 Best Practices

### สำหรับทีม
1. **Review PRs ภายใน 24 ชั่วโมง**
2. **Run tests ก่อน merge**
3. **Document breaking changes**
4. **Communicate กับทีมอื่นๆ**

### สำหรับ Security Team
1. **Monitor security advisories**
2. **Prioritize critical updates**
3. **Coordinate emergency deployments**
4. **Maintain security documentation**

### สำหรับ DevOps Team
1. **Monitor CI/CD pipeline**
2. **Ensure smooth deployments**
3. **Maintain staging environment**
4. **Monitor performance metrics**

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Automated Testing** - Auto-run tests on PR creation
- [ ] **Canary Deployments** - Gradual rollout of dependency updates
- [ ] **Performance Monitoring** - Track performance impact
- [ ] **Cost Optimization** - Monitor license changes

### Integration Opportunities
- **Security Scanning** - Integrate with Snyk, SonarQube
- **License Compliance** - Check for license changes
- **Performance Testing** - Automated performance checks
- **Documentation Updates** - Auto-update docs for breaking changes

---

## 📚 Resources

### Documentation
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [GitHub Security](https://docs.github.com/en/code-security)
- [npm Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [pip Audit](https://pip.pypa.io/en/stable/cli/pip_audit/)

### Tools
- **Security Scanning:** Snyk, SonarQube, Trivy
- **Dependency Analysis:** depcheck, pip-check
- **License Compliance:** FOSSA, WhiteSource
- **Performance Testing:** Lighthouse, WebPageTest

### Support
- **GitHub Support:** สำหรับ Dependabot issues
- **Security Team:** สำหรับ security concerns
- **DevOps Team:** สำหรับ deployment issues
- **Backend/Frontend Teams:** สำหรับ technical questions

---

## 🤝 Team Responsibilities

### Backend Team
- Review Python dependency updates
- Test backend functionality
- Update API documentation if needed

### Frontend Team
- Review npm dependency updates
- Test UI/UX functionality
- Update frontend documentation

### Security Team
- Review security updates
- Coordinate emergency deployments
- Maintain security documentation

### DevOps Team
- Monitor CI/CD pipeline
- Ensure smooth deployments
- Maintain infrastructure

---

## 📞 Contact & Support

### Emergency Contacts
- **Security Issues:** @team-security
- **Build Failures:** @team-devops
- **Dependency Conflicts:** @team-backend / @team-frontend

### Regular Support
- **GitHub Issues:** ใช้ label `dependencies`
- **Slack Channel:** #dependencies
- **Email:** dependencies@meechain.io

---

**✨ Dependabot: Keeping MeeChain Secure and Up-to-Date!** 🚀

---

*Last Updated: March 2026*  
*Version: 1.0.0*  
*Status: Production Ready*