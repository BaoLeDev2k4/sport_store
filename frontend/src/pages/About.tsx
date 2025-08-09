import React from "react";
import { Typography } from "antd";
import "../scss/About.scss";

const { Title, Paragraph } = Typography;

const About: React.FC = () => {
  // Ảnh quảng cáo (phần giới thiệu)
  const introGallery = [
    "https://penbodisplay.com/wp-content/uploads/2024/02/Sportswear-store-design9.jpg",
    "https://penbodisplay.com/wp-content/uploads/2024/02/Sportswear-store-design10.jpg",
    "https://penbodisplay.com/wp-content/uploads/2024/02/Sportswear-store-design5.jpg",
  ];

  // Ảnh minh họa lý do chọn Sport Store
  const reasonGallery = [
    "https://n7media.coolmate.me/uploads/February2023/mceclip1_19.png",
    "https://n7media.coolmate.me/uploads/May2025/top-15-vi-tri-in-logo-len-ao-thun-dep-chuan-nhat-2025.jpg",
    "https://n7media.coolmate.me/uploads/April2025/in-chuyen-nhiet-la-gi.jpg",
  ];

  const reasons = [
    {
      title: "Tầm nhìn",
      content:
        "Sport Store định hướng trở thành hệ thống bán lẻ đồ thể thao hàng đầu Việt Nam, nơi khách hàng có thể tìm thấy mọi trang phục & phụ kiện chính hãng với mức giá hợp lý. Chúng tôi không chỉ bán sản phẩm mà còn xây dựng cộng đồng yêu thể thao năng động.",
    },
    {
      title: "Kinh nghiệm",
      content:
        "Nhiều năm hoạt động, am hiểu quần áo tập luyện, giày chạy, đồ gym, cầu lông, bóng đá, yoga. Hệ thống kho vận phủ rộng giúp đơn hàng đến tay bạn nhanh & an toàn.",
    },
    {
      title: "Chất lượng sản phẩm",
      content:
        "100 % sản phẩm nhập chính hãng hoặc phân phối độc quyền. Từng mặt hàng đều qua khâu kiểm định chất lượng nghiêm ngặt trước khi lên kệ.",
    },
    {
      title: "Dịch vụ khách hàng",
      content:
        "CSKH 24/7 qua điện thoại, Zalo, live‑chat. Đổi trả trong 7 ngày, hoàn tiền nhanh, bảo hành theo từng sản phẩm và chương trình tích điểm ưu đãi.",
    },
    {
      title: "Đối tác chiến lược",
      content:
        "Đại lý chính thức của Nike, Adidas, Yonex, Lining, Reebok… Nhờ vậy, Sport Store luôn cập nhật mẫu mới sớm nhất cho bạn.",
    },
  ];

  const feedbacks = [
    {
      name: "Trần Văn Minh",
      text: "Giày đá bóng Adidas giao nhanh, đóng gói cẩn thận. Rất hài lòng!",
      avatar: "https://picsum.photos/id/1011/100/100",
    },
    {
      name: "Nguyễn Thị Hằng",
      text: "Nhiều mẫu áo training đẹp, giá tốt. Tư vấn viên cực kỳ nhiệt tình.",
      avatar: "https://picsum.photos/id/1012/100/100",
    },
    {
      name: "Phạm Quốc Dũng",
      text: "Chính sách đổi size miễn phí quá tiện. Sẽ ủng hộ lâu dài.",
      avatar: "https://picsum.photos/id/1013/100/100",
    },
  ];

  const team = [
    { name: "Khánh Duy", img: "/images/posts/khanh-duy.jpg" },
    { name: "Văn Bảo", img: "/images/posts/van-bao.jpg" },
    { name: "Hữu Tiến", img: "/images/posts/huu-tien.jpg" },
    { name: "Trọng Nghĩa", img: "/images/posts/trong-nghia.jpg" },
  ];

  return (
    <div className="about-page">
      {/* Giới thiệu */}
      <section className="about-header">
        <Title level={2}>Giới thiệu về Sport Store</Title>
        <Paragraph>
          Sport Store là địa chỉ tin cậy dành cho những người yêu thể thao. Với cam
          kết <strong>“Chất lượng   Chính hãng – Giá tốt”</strong>, chúng tôi đồng
          hành cùng hàng ngàn khách hàng trên toàn quốc, cung cấp từ trang phục tập
          luyện đến phụ kiện thi đấu chuyên nghiệp.
        </Paragraph>
      </section>

      {/* Ảnh quảng cáo */}
      <section className="about-gallery">
        {introGallery.map((src, i) => (
          <img src={src} alt={`intro-${i}`} key={i} />
        ))}
      </section>

      {/* Tại sao chọn Sport Store */}
      <section className="choose-store-section">
        <Title level={2} className="section-title">
          Tại sao chọn Sport Store?
        </Title>
        <div className="choose-store">
          <div className="choose-store__left">
            {reasons.map((r, i) => (
              <div className="reason-block" key={i}>
                <Title level={4}>{r.title}</Title>
                <Paragraph>{r.content}</Paragraph>
              </div>
            ))}
          </div>
          <div className="choose-store__right">
            {reasonGallery.map((src, i) => (
              <img src={src} alt={`reason-${i}`} key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Phản hồi khách hàng */}
      <section className="about-feedback">
        <Title level={2} className="section-title">
          Phản hồi từ khách hàng
        </Title>
        <div className="feedback-list">
          {feedbacks.map((f, i) => (
            <div className="feedback-item" key={i}>
              <img src={f.avatar} alt={f.name} />
              <Paragraph className="feedback-text">“{f.text}”</Paragraph>
              <p className="feedback-name">— {f.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Đội ngũ phát triển */}
      <section className="about-team">
        <Title level={2} className="section-title">
          Đội ngũ phát triển
        </Title>
        <div className="team-list">
          {team.map((m, i) => (
            <div className="team-member" key={i}>
              <img src={m.img} alt={m.name} />
              <p className="team-name">{m.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bản đồ Google Maps */}
      <section className="about-map">
        <Title level={2} className="section-title">Địa chỉ cửa hàng</Title>
        <div className="map-container">
          <iframe
            title="Sport Store Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4426574722697!2d106.62322047451812!3d10.85389765776104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b6c59ba4c97%3A0x535e784068f1558b!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1751479618985!5m2!1svi!2s"
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default About;
