# 🚀 Pull Request Template - MeeChain

**🇹🇭 ภาษาไทย:** กรุณากรอกข้อมูลตาม template นี้เพื่อให้การรีวิวโค้ดเป็นไปอย่างมีประสิทธิภาพ  
**🇬🇧 English:** Please fill out this template to ensure efficient code review

---

## 📋 PR Information

### PR Title
<!-- ชื่อ PR ที่สื่อความหมายชัดเจน -->
<!-- Clear and descriptive PR title -->

### Related Issue
<!-- ลิงก์ไปยัง issue ที่เกี่ยวข้อง (ถ้ามี) -->
<!-- Link to related issue (if any) -->
Closes # <!-- Issue number -->

### Type of Change
<!-- ✅ เลือกประเภทของการเปลี่ยนแปลง (เลือกอย่างน้อย 1 ข้อ) -->
<!-- ✅ Select the type of change (choose at least one) -->

- [ ] 🐛 **Bug Fix** - แก้ไขข้อผิดพลาด
- [ ] ✨ **New Feature** - เพิ่มฟีเจอร์ใหม่
- [ ] ♻️ **Refactoring** - ปรับปรุงโครงสร้างโค้ด
- [ ] 📚 **Documentation** - อัปเดตเอกสาร
- [ ] ⚡ **Performance** - ปรับปรุงประสิทธิภาพ
- [ ] 🔒 **Security** - แก้ไขปัญหาด้านความปลอดภัย
- [ ] 📦 **Dependencies** - อัปเดต dependencies
- [ ] 🧪 **Tests** - เพิ่ม/ปรับปรุงการทดสอบ
- [ ] 🎨 **UI/UX** - ปรับปรุงส่วนติดต่อผู้ใช้
- [ ] 🚀 **Deployment** - ปรับปรุงการ deploy
- [ ] 🔧 **Configuration** - เปลี่ยนค่า config
- [ ] 🧹 **Cleanup** - ทำความสะอาดโค้ด

---

## 📝 Description

### 🇹🇭 ภาษาไทย
<!-- อธิบายการเปลี่ยนแปลงที่ทำ ทำไมต้องเปลี่ยนแปลง และมีผลกระทบอย่างไร -->
<!-- Describe what changes were made, why they were made, and their impact -->

### 🇬🇧 English
<!-- Describe what changes were made, why they were made, and their impact -->

---

## 🔍 Changes Made

### Files Modified
<!-- ระบุไฟล์ที่เปลี่ยนแปลง -->
<!-- List modified files -->

```
/path/to/file1.py
/path/to/file2.tsx
```

### Key Changes
<!-- สรุปการเปลี่ยนแปลงสำคัญ -->
<!-- Summary of key changes -->

1. 
2. 
3. 

---

## ✅ Pre-PR Checklist

### 🇹🇭 ภาษาไทย: กรุณาตรวจสอบก่อนสร้าง PR
### 🇬🇧 English: Please verify before creating PR

#### 🧪 Testing
- [ ] ✅ **Unit Tests** - ทดสอบฟังก์ชันพื้นฐาน
- [ ] ✅ **Integration Tests** - ทดสอบการทำงานร่วมกัน
- [ ] ✅ **End-to-End Tests** - ทดสอบ workflow ทั้งหมด
- [ ] ✅ **Manual Testing** - ทดสอบด้วยตนเอง

#### 📱 UI/UX (สำหรับ Frontend)
- [ ] ✅ **Responsive Design** - ทำงานได้ทุกขนาดหน้าจอ
- [ ] ✅ **Browser Compatibility** - ทำงานได้ทุกเบราว์เซอร์
- [ ] ✅ **Accessibility** - เข้าถึงได้สำหรับผู้พิการ
- [ ] ✅ **Performance** - โหลดเร็วและ responsive

#### 🔒 Security
- [ ] ✅ **Input Validation** - ตรวจสอบข้อมูลนำเข้า
- [ ] ✅ **Authentication** - ระบบยืนยันตัวตนปลอดภัย
- [ ] ✅ **Authorization** - ระบบสิทธิ์การเข้าถึง
- [ ] ✅ **No Hardcoded Secrets** - ไม่มี secret ในโค้ด

#### 📚 Documentation
- [ ] ✅ **Code Comments** - มีคอมเมนต์ในโค้ด
- [ ] ✅ **API Documentation** - อัปเดต OpenAPI/Swagger
- [ ] ✅ **README Updates** - อัปเดตเอกสารหลัก
- [ ] ✅ **Changelog** - อัปเดตบันทึกการเปลี่ยนแปลง

#### 🛠️ Code Quality
- [ ] ✅ **Linting Passed** - ผ่านการตรวจสอบ style
- [ ] ✅ **Type Checking** - ผ่านการตรวจสอบ type
- [ ] ✅ **Build Successful** - build ผ่านไม่มี error
- [ ] ✅ **No Breaking Changes** - ไม่ทำลาย existing functionality

---

## 🧪 Testing Details

### Test Environment
<!-- สภาพแวดล้อมที่ใช้ทดสอบ -->
<!-- Test environment used -->

- [ ] 🖥️ **Local Development**
- [ ] 🧪 **Staging Environment**
- [ ] 🚀 **Production-like Environment**

### Test Results
<!-- ผลการทดสอบ -->
<!-- Test results -->

```bash
# ตัวอย่างผลลัพธ์การทดสอบ
# Example test output
pytest --cov=./ --cov-report=html
# Coverage: 85%
# Tests passed: 42/42
```

### Test Coverage
<!-- ความครอบคลุมของการทดสอบ -->
<!-- Test coverage -->

- **Backend Coverage:** <!-- percentage -->
- **Frontend Coverage:** <!-- percentage -->
- **New Tests Added:** <!-- number -->

---

## 📊 Impact Analysis

### Performance Impact
<!-- ผลกระทบต่อประสิทธิภาพ -->
<!-- Performance impact -->

- [ ] ⬆️ **Performance Improved**
- [ ] ⬇️ **Performance Degraded**
- [ ] ➡️ **No Significant Change**

### Security Impact
<!-- ผลกระทบด้านความปลอดภัย -->
<!-- Security impact -->

- [ ] 🔒 **Security Improved**
- [ ] ⚠️ **Security Considered**
- [ ] ❓ **Needs Security Review**

### Breaking Changes
<!-- การเปลี่ยนแปลงที่อาจทำลาย existing functionality -->
<!-- Changes that might break existing functionality -->

- [ ] ✅ **No Breaking Changes**
- [ ] ⚠️ **Minor Breaking Changes**
- [ ] 🚨 **Major Breaking Changes**

---

## 🎨 Screenshots & Visuals

### Before Changes
<!-- ภาพก่อนการเปลี่ยนแปลง (ถ้ามี) -->
<!-- Screenshots before changes (if applicable) -->

### After Changes
<!-- ภาพหลังการเปลี่ยนแปลง -->
<!-- Screenshots after changes -->

---

## 🚀 Deployment Notes

### Backend Deployment
<!-- หมายเหตุการ deploy backend -->
<!-- Backend deployment notes -->

```yaml
# ตัวอย่าง configuration changes
# Example configuration changes
environment_variables:
  NEW_FEATURE_ENABLED: true
  API_RATE_LIMIT: 100
```

### Frontend Deployment
<!-- หมายเหตุการ deploy frontend -->
<!-- Frontend deployment notes -->

```bash
# Build commands
npm run build
# Bundle size: 1.2MB → 1.3MB (+8%)
```

### Database Changes
<!-- การเปลี่ยนแปลง database (ถ้ามี) -->
<!-- Database changes (if any) -->

```sql
-- Migration SQL
ALTER TABLE users ADD COLUMN new_feature_enabled BOOLEAN DEFAULT false;
```

---

## 🔗 Related Resources

### Documentation
<!-- เอกสารที่เกี่ยวข้อง -->
<!-- Related documentation -->

- [API Documentation](link-to-api-docs)
- [Design Mockups](link-to-design)
- [Technical Spec](link-to-spec)

### Dependencies
<!-- Dependencies ที่เกี่ยวข้อง -->
<!-- Related dependencies -->

```json
// package.json changes
{
  "dependencies": {
    "new-library": "^1.0.0"
  }
}
```

---

## 🤝 Review Guidelines

### สำหรับ Reviewer
<!-- คำแนะนำสำหรับผู้รีวิว -->
<!-- Guidelines for reviewers -->

1. **Focus Areas:**
   - [ ] Code correctness
   - [ ] Performance implications
   - [ ] Security considerations
   - [ ] Test coverage

2. **Review Timeline:**
   - Initial review within 24 hours
   - Follow-up within 48 hours

3. **Communication:**
   - Use constructive feedback
   - Provide specific examples
   - Suggest improvements

### สำหรับ Author
<!-- คำแนะนำสำหรับผู้เขียน PR -->
<!-- Guidelines for PR author -->

1. **Be Responsive:**
   - Respond to comments within 24 hours
   - Address all feedback
   - Keep the conversation going

2. **Update PR:**
   - Push updates as new commits
   - Mark comments as resolved
   - Keep PR description updated

---

## 📈 Metrics & Monitoring

### Performance Metrics
<!-- ตัวชี้วัดประสิทธิภาพ -->
<!-- Performance metrics -->

- **Response Time:** <!-- before/after -->
- **Memory Usage:** <!-- before/after -->
- **CPU Usage:** <!-- before/after -->

### Business Metrics
<!-- ตัวชี้วัดธุรกิจ -->
<!-- Business metrics -->

- **User Impact:** <!-- number of users affected -->
- **Feature Usage:** <!-- expected usage -->
- **Revenue Impact:** <!-- if applicable -->

---

## 🎯 Success Criteria

### Acceptance Criteria
<!-- เกณฑ์การยอมรับ -->
<!-- Acceptance criteria -->

- [ ] All tests pass
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Performance benchmarks met
- [ ] Security review completed

### Definition of Done
<!-- นิยามของ "เสร็จสมบูรณ์" -->
<!-- Definition of done -->

- [ ] ✅ Code merged to main
- [ ] ✅ Deployed to staging
- [ ] ✅ Verified in staging
- [ ] ✅ Deployed to production
- [ ] ✅ Monitoring in place

---

## ❓ Questions & Discussion

### Open Questions
<!-- คำถามที่ยังไม่มีคำตอบ -->
<!-- Open questions -->

1. 
2. 
3. 

### Discussion Points
<!-- ประเด็นที่ต้องการ discuss -->
<!-- Points for discussion -->

1. 
2. 
3. 

---

## 📝 Additional Notes

<!-- หมายเหตุเพิ่มเติม -->
<!-- Additional notes -->

---

**🇹🇭 ขอบคุณสำหรับ contribution ของคุณ!**  
**🇬🇧 Thank you for your contribution!**  

✨ *"Good code is written with care, reviewed with wisdom, and merged with confidence."* ✨