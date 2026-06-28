import React, { useState } from "react";
import { SportType } from "../types";
import { BookOpen, Award, CheckCircle2 } from "lucide-react";

export const RulesInfo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SportType>(SportType.BADMINTON);

  return (
    <div id="rules-info-container" className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Panduan Aturan Resmi</h2>
          <p className="text-xs text-slate-400">Aturan standar BWF (Badminton) & ITTF (Table Tennis)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-6">
        <button
          onClick={() => setActiveTab(SportType.BADMINTON)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-xs transition-all ${
            activeTab === SportType.BADMINTON
              ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Bulu Tangkis (Badminton)
        </button>
        <button
          onClick={() => setActiveTab(SportType.TABLE_TENNIS)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-xs transition-all ${
            activeTab === SportType.TABLE_TENNIS
              ? "bg-blue-500 text-slate-950 font-bold shadow-md shadow-blue-500/10"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Tenis Meja (Pingpong)
        </button>
      </div>

      {activeTab === SportType.BADMINTON ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Badminton Rules */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mb-2.5 font-mono uppercase tracking-wider">
              <Award className="w-4 h-4" /> Sistem Penilaian (BWF)
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Satu pertandingan dimainkan dalam sistem <strong>Best of 3 (terbaik dari 3 set)</strong>, di mana pemenang ditentukan oleh tim yang meraih 2 set kemenangan terlebih dahulu.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Setiap set dimainkan hingga <strong>21 poin</strong> (Sistem Reli Poin). Siapa pun yang memenangkan reli akan mendapatkan poin, terlepas dari siapa yang melakukan servis.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Aturan Jus (Deuce):</strong> Jika skor mencapai 20-20, salah satu tim harus memimpin selisih 2 poin (misal 22-20) untuk memenangkan set tersebut.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Batas Maksimal Jus:</strong> Jika skor terus seimbang hingga 29-29, tim pertama yang menyentuh angka <strong>30 poin</strong> langsung memenangkan set tersebut (tanpa selisih 2 poin).</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mb-2.5 font-mono uppercase tracking-wider">
              <Award className="w-4 h-4" /> Aturan Servis & Posisi Berdiri
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Skor Genap (0, 2, 4, ...):</strong> Pemain yang melakukan servis harus berdiri di <strong>kotak servis kanan</strong> dan memukul shuttlecock secara diagonal ke kotak kanan lawan.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Skor Ganjil (1, 3, 5, ...):</strong> Pemain yang melakukan servis harus berdiri di <strong>kotak servis kiri</strong> dan memukul diagonal ke kotak kiri lawan.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Aturan Ganda:</strong> Posisi pemain yang melakukan servis hanya bertukar tempat (kanan ke kiri atau sebaliknya) ketika tim mereka mendapatkan poin dari posisi servis mereka sebelumnya. Tim penerima tidak bertukar posisi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Pindah Lapangan:</strong> Pemain berpindah sisi lapangan setelah set pertama selesai, setelah set kedua selesai (jika ada set ketiga), dan pada set ketiga ketika salah satu tim mencapai skor <strong>11 poin</strong> pertama kali.</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Table Tennis Rules */}
          <div>
            <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-1.5 mb-2.5 font-mono uppercase tracking-wider">
              <Award className="w-4 h-4" /> Sistem Penilaian (ITTF)
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Pertandingan biasanya dimainkan dalam sistem <strong>Best of 3 atau Best of 5 (terbaik dari 5 set)</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Satu set dimenangkan oleh pemain/pasangan yang pertama kali mencapai skor <strong>11 poin</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Aturan Jus (Deuce):</strong> Jika skor mencapai 10-10, permainan dilanjutkan hingga salah satu pihak unggul selisih 2 poin (misal 12-10). Tidak ada batas poin maksimal (bisa berlanjut tanpa batas).</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-1.5 mb-2.5 font-mono uppercase tracking-wider">
              <Award className="w-4 h-4" /> Rotasi Servis (Pingpong)
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Hak melakukan servis berpindah setiap kali total poin yang dimainkan bertambah <strong>2 poin</strong> (misal dari servis A ke servis B pada total skor 2, 4, 6, dst).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Ketika Deuce (10-10):</strong> Rotasi servis dipercepat menjadi bergantian setiap <strong>1 poin</strong> hingga set selesai.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Arah Servis Tunggal:</strong> Servis dapat dilakukan bebas dari mana saja dan memantul ke area mana saja di meja lawan.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Arah Servis Ganda:</strong> Bola harus dipukul dari bagian kanan meja sendiri secara diagonal ke bagian kanan meja penerima lawan. Servis yang memantul di area kiri dinyatakan out.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
